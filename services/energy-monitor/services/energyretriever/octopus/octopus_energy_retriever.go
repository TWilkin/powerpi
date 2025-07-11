package octopus

import (
	"fmt"

	"powerpi/common/services/http"
	"powerpi/common/services/logger"
	messageQueue "powerpi/common/services/mqtt/messagequeue"
	"powerpi/common/utils"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type OctopusEnergyRetriever[TMeter models.OctopusMeterSensor] struct {
	*energyRetriever.BaseEnergyRetriever[TMeter]
	httpClientFactory http.HTTPClientFactory
}

const baseURL = "https://api.octopus.energy/v1"

func NewOctopusEnergyRetriever[TMeter models.OctopusMeterSensor](
	eventMessageService messageQueue.EventMessageService,
	httpClientFactory http.HTTPClientFactory,
	config config.ConfigService,
	logger logger.LoggerService,
	meter TMeter,
) *OctopusEnergyRetriever[TMeter] {
	return &OctopusEnergyRetriever[TMeter]{
		BaseEnergyRetriever: &energyRetriever.BaseEnergyRetriever[TMeter]{
			EventMessageService: eventMessageService,
			Config:              config,
			Logger:              logger,
			Meter:               meter,
		},
		httpClientFactory: httpClientFactory,
	}
}

func (retriever *OctopusEnergyRetriever[TMeter]) Read() {
	retriever.Logger.Info("Reading energy data from Octopus meter", "meter", retriever.Meter.GetName())

	retriever.readConsumption()
}

func (retriever *OctopusEnergyRetriever[TMeter]) readConsumption() {
	// identify the type of meter
	var meterType string
	_, success := retriever.Meter.GetMetrics()[models.MeterMetricElectricity]
	if success {
		meterType = string(models.MeterMetricElectricity)
	} else {
		_, success := retriever.Meter.GetMetrics()[models.MeterMetricGas]
		if success {
			meterType = string(models.MeterMetricGas)
		} else {
			retriever.Logger.Error("Unsupported meter type for consumption retrieval", "meter", retriever.Meter.GetName())
			return
		}
	}

	url, err := utils.GenerateURL(
		baseURL,
		[]string{fmt.Sprintf("%s-meter-points", meterType), retriever.Meter.GetId(), "meters", retriever.Meter.GetSerialNumber(), "consumption"},
		map[string]string{
			"page_size":   "2",
			"period_from": "2025-07-01T00:00:00",
			"period_to":   "2025-07-02T00:00:00",
		},
	)
	if err != nil {
		retriever.Logger.Error("Failed to generate URL for consumption data", "error", err)
		return
	}
	retriever.Logger.Debug("Generated URL for consumption data", "url", url)

	client := retriever.httpClientFactory.BuildClient()
	client.SetBasicAuth(*retriever.Config.GetOctopusAPIKey(), "")

	data, err := http.Get[ConsumptionResponse](client, url)
	if err != nil {
		retriever.Logger.Error("Failed to request consumption data", "error", err)
		return
	}

	retriever.Logger.Info("Successfully retrieved consumption data", "count", data.Count)

	// TODO work out gas units based on the meter type
	// TODO publish the data at the correct point in time
	for _, result := range data.Results {
		retriever.EventMessageService.PublishValue(
			retriever.Meter.GetName(),
			meterType,
			result.Consumption,
			"kWh",
		)
	}
}

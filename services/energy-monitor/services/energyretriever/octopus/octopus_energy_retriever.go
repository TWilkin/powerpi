package octopus

import (
	"fmt"
	"strings"
	"time"

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
	meterType := retriever.GetMeterType()

	url, err := utils.GenerateURL(
		baseURL,
		[]string{
			fmt.Sprintf("%s-meter-points", meterType),
			retriever.Meter.GetId(),
			"meters",
			retriever.Meter.GetSerialNumber(),
			"consumption",
		},
		map[string]string{
			"page_size":   "100",
			"period_from": retriever.GetStartDate().Format(time.RFC3339),
			"period_to":   time.Now().Format(time.RFC3339),
			"order_by":    "period",
		},
	)
	if err != nil {
		retriever.Logger.Error("Failed to generate URL for consumption data", "error", err)
		return
	}
	retriever.Logger.Debug("Generated URL for consumption data", "url", url)

	client := retriever.httpClientFactory.BuildClient()
	client.SetBasicAuth(*retriever.Config.GetOctopusAPIKey(), "")

	// Identify the unit based on the meter type
	unit := "kWh"
	if meterType == string(models.MeterMetricGas) && strings.EqualFold(retriever.Meter.GetGeneration(), "SMETS2") {
		unit = "m3"
	}

	for {
		data, err := http.Get[ConsumptionResponse](client, url)
		if err != nil {
			retriever.Logger.Error("Failed to request consumption data", "error", err)
			break
		}

		retriever.Logger.Info("Successfully retrieved consumption data", "count", data.Count)

		for _, result := range data.Results {
			retriever.PublishValue(
				result.Consumption,
				unit,
				result.IntervalEnd.UnixMilli(),
			)
		}

		if data.Next == nil {
			break
		}

		url = *data.Next
	}
}

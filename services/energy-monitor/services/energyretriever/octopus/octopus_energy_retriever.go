package octopus

import (
	"fmt"

	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/common/utils"
	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type OctopusEnergyRetriever[TMeter models.OctopusMeterSensor] struct {
	*energyRetriever.BaseEnergyRetriever[TMeter]
}

const baseURL = "https://api.octopus.energy/v1"

func NewOctopusEnergyRetriever[TMeter models.OctopusMeterSensor](mqttService mqtt.MqttService, logger logger.LoggerService, meter TMeter) *OctopusEnergyRetriever[TMeter] {
	return &OctopusEnergyRetriever[TMeter]{
		BaseEnergyRetriever: &energyRetriever.BaseEnergyRetriever[TMeter]{
			MqttService: mqttService,
			Logger:      logger,
			Meter:       meter,
		},
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
		meterType = "electricity"
	} else {
		meterType = "gas"
	}

	url, err := utils.GenerateURL(
		baseURL,
		[]string{fmt.Sprintf("%s-meter-points", meterType), retriever.Meter.GetId(), "meters", retriever.Meter.GetSerialNumber(), "consumption"},
		map[string]string{
			"page_size":   "100",
			"period_from": "2025-07-01T00:00:00",
			"period_to":   "2025-07-02T00:00:00",
		},
	)
	if err != nil {
		retriever.Logger.Error("Failed to generate URL for consumption data", "error", err)
		return
	}

	retriever.Logger.Info("Generated URL for consumption data", "url", url)
}

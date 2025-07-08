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

	serialNumber, err := retriever.ReadSerialNumber()
	if err != nil {
		retriever.Logger.Error("Failed to read serial number", "error", err)
		return
	}

	retriever.readConsumption(serialNumber)
}

func (retriever *OctopusEnergyRetriever[TMeter]) ReadSerialNumber() (string, error) {
	retriever.Logger.Info("Reading account data from Octopus")

	url, err := utils.GenerateURL(
		baseURL,
		[]string{"accounts", retriever.Meter.GetAccount()},
		nil)
	if err != nil {
		return "", err
	}

	retriever.Logger.Info("Generated URL for account data", "url", url)
	return "serial-number", nil
}

func (retriever *OctopusEnergyRetriever[TMeter]) readConsumption(serialNumber string) {
	// identify the type of meter
	var meterType string
	var meterId string
	_, success := retriever.Meter.GetMetrics()[models.MeterMetricElectricity]
	if success {
		meterType = "electricity"
	} else {
		meterType = "gas"
	}
	meterId = retriever.Meter.GetId()

	url, err := utils.GenerateURL(
		baseURL,
		[]string{fmt.Sprintf("%s-meter-points", meterType), meterId, "meters", serialNumber, "consumption"},
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

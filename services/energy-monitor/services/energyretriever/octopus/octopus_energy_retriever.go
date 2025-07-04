package octopus

import (
	"fmt"

	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/common/utils"
	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type OctopusEnergyRetriever struct {
	*energyRetriever.BaseEnergyRetriever
}

const baseURL = "https://api.octopus.energy/v1"

func NewOctopusEnergyRetriever(mqttService mqtt.MqttService, logger logger.LoggerService, meter models.MeterSensor) *OctopusEnergyRetriever {
	return &OctopusEnergyRetriever{
		BaseEnergyRetriever: &energyRetriever.BaseEnergyRetriever{
			MqttService: mqttService,
			Logger:      logger,
			Meter:       meter,
		},
	}
}

func (retriever *OctopusEnergyRetriever) Read() {
	retriever.Logger.Info("Reading energy data from Octopus meter", "meter", retriever.Meter.Name)

	serialNumber, err := retriever.ReadSerialNumber()
	if err != nil {
		retriever.Logger.Error("Failed to read serial number", "error", err)
		return
	}

	retriever.readConsumption(serialNumber)
}

func (retriever *OctopusEnergyRetriever) ReadSerialNumber() (string, error) {
	retriever.Logger.Info("Reading account data from Octopus")

	url, err := utils.GenerateURL(
		baseURL,
		[]string{"accounts", retriever.Meter.Account},
		nil)
	if err != nil {
		return "", err
	}

	retriever.Logger.Info("Generated URL for account data", "url", url)
	return "serial-number", nil
}

func (retriever *OctopusEnergyRetriever) readConsumption(serialNumber string) {
	// identify the type of meter
	var meterType string
	var meterId string
	_, success := retriever.Meter.Metrics[models.MeterMetricElectricity]
	if success {
		meterType = "electricity"
		meterId = retriever.Meter.MPAN
	} else {
		meterType = "gas"
		meterId = retriever.Meter.MPRN
	}

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

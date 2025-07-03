package octopus

import (
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type OctopusEnergyRetriever struct {
	*energyRetriever.BaseEnergyRetriever
}

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
}

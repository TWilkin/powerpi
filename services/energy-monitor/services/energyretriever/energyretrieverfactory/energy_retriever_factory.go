package energyretrieverfactory

import (
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
	"powerpi/energy-monitor/services/energyretriever/octopus"
)

type EnergyRetrieverFactory interface {
	BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever
}

type energyRetrieverFactory struct {
	mqttService mqtt.MqttService
	logger      logger.LoggerService
}

func NewEnergyRetrieverFactory(mqttService mqtt.MqttService, logger logger.LoggerService) EnergyRetrieverFactory {
	return &energyRetrieverFactory{
		mqttService: mqttService,
		logger:      logger,
	}
}

func (factory *energyRetrieverFactory) BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever {
	if octopusMeter, success := meter.(models.OctopusMeterSensor); success {
		return octopus.NewOctopusEnergyRetriever(factory.mqttService, factory.logger, octopusMeter)
	}

	factory.logger.Warn("Unsupported meter type for energy retrieval: %T", meter)
	return nil
}

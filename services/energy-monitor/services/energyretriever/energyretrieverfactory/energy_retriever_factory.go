package energyretrieverfactory

import (
	"powerpi/common/services/http"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
	"powerpi/energy-monitor/services/energyretriever/octopus"
)

type EnergyRetrieverFactory interface {
	BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever
}

type energyRetrieverFactory struct {
	mqttService       mqtt.MqttService
	config            config.ConfigService
	logger            logger.LoggerService
	httpClientFactory http.HTTPClientFactory
}

func NewEnergyRetrieverFactory(mqttService mqtt.MqttService, config config.ConfigService, logger logger.LoggerService) EnergyRetrieverFactory {
	return &energyRetrieverFactory{
		mqttService: mqttService,
		config:      config,
		logger:      logger,
	}
}

func (factory *energyRetrieverFactory) BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever {
	if octopusMeter, success := meter.(models.OctopusMeterSensor); success {
		return octopus.NewOctopusEnergyRetriever(factory.mqttService, factory.config, factory.logger, factory.httpClientFactory, octopusMeter)
	}

	factory.logger.Warn("Unsupported meter type for energy retrieval: %T", meter)
	return nil
}

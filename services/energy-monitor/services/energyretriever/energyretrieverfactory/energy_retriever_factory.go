package energyretrieverfactory

import (
	"powerpi/common/services/http"
	"powerpi/common/services/logger"
	messageQueue "powerpi/common/services/mqtt/messagequeue"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
	"powerpi/energy-monitor/services/energyretriever/octopus"
)

type EnergyRetrieverFactory interface {
	BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever
}

type energyRetrieverFactory struct {
	eventMessageService messageQueue.EventMessageService
	httpClientFactory   http.HTTPClientFactory
	config              config.ConfigService
	logger              logger.LoggerService
}

func NewEnergyRetrieverFactory(
	eventMessageService messageQueue.EventMessageService,
	httpClientFactory http.HTTPClientFactory,
	config config.ConfigService,
	logger logger.LoggerService,
) EnergyRetrieverFactory {
	return &energyRetrieverFactory{
		eventMessageService: eventMessageService,
		httpClientFactory:   httpClientFactory,
		config:              config,
		logger:              logger,
	}
}

func (factory *energyRetrieverFactory) BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever {
	if octopusMeter, success := meter.(models.OctopusMeterSensor); success {
		return octopus.NewOctopusEnergyRetriever(
			factory.eventMessageService,
			factory.httpClientFactory,
			factory.config,
			factory.logger,
			octopusMeter,
		)
	}

	factory.logger.Warn("Unsupported meter type for energy retrieval: %T", meter)
	return nil
}

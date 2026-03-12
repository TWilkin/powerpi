package energyretrieverfactory

import (
	"fmt"

	"github.com/TWilkin/powerpi/common/services/http"
	"github.com/TWilkin/powerpi/common/services/logger"
	messageQueue "github.com/TWilkin/powerpi/common/services/mqtt/messagequeue"
	"github.com/TWilkin/powerpi/energy-monitor/models"
	"github.com/TWilkin/powerpi/energy-monitor/services/config"
	energyRetriever "github.com/TWilkin/powerpi/energy-monitor/services/energyretriever"
	"github.com/TWilkin/powerpi/energy-monitor/services/energyretriever/octopus"
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

	factory.logger.Warn("Unsupported meter type for energy retrieval", "type", fmt.Sprintf("%T", meter))
	return nil
}

package energyretriever

import (
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt/messagequeue"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
)

type EnergyRetriever interface {
	Read()
}

type BaseEnergyRetriever[TMeter models.MeterSensor] struct {
	EventMessageService messagequeue.EventMessageService
	Config              config.ConfigService
	Logger              logger.LoggerService

	Meter TMeter
}

package energyretriever

import (
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
)

type EnergyRetriever interface {
	Read()
}

type BaseEnergyRetriever[TMeter models.MeterSensor] struct {
	MqttService mqtt.MqttService
	Logger      logger.LoggerService

	Meter TMeter
}

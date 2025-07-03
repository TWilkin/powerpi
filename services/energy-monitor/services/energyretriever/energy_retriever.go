package energyretriever

import (
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
)

type EnergyRetriever interface {
	Read()
}

type BaseEnergyRetriever struct {
	MqttService mqtt.MqttService
	Logger      logger.LoggerService

	Meter models.MeterSensor
}

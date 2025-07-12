package energyretriever

import (
	"time"

	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt/messagequeue"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
)

type EnergyRetriever interface {
	GetMeterType() string
	Read()
	PublishValue(value float64, unit string, timestamp int64)
}

type BaseEnergyRetriever[TMeter models.MeterSensor] struct {
	EventMessageService messagequeue.EventMessageService
	Config              config.ConfigService
	Logger              logger.LoggerService

	Meter TMeter
}

func (retriever *BaseEnergyRetriever[TMeter]) GetMeterType() string {
	_, success := retriever.Meter.GetMetrics()[models.MeterMetricElectricity]
	if success {
		return string(models.MeterMetricElectricity)
	}

	_, success = retriever.Meter.GetMetrics()[models.MeterMetricGas]
	if success {
		return string(models.MeterMetricGas)
	}

	retriever.Logger.Error("Unsupported meter type for consumption retrieval", "meter", retriever.Meter.GetName())
	panic("Unsupported meter type for consumption retrieval")
}

func (retriever *BaseEnergyRetriever[TMeter]) PublishValue(value float64, unit string, timestamp int64) {
	retriever.EventMessageService.PublishValueWithTime(
		retriever.Meter.GetName(),
		retriever.GetMeterType(),
		value,
		unit,
		&timestamp,
	)

	time.Sleep(time.Duration(retriever.Config.GetEnergyMonitorConfig().MessageWriteDelay) * time.Millisecond)
}

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
	GetStartDate() time.Time

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

func (retriever *BaseEnergyRetriever[TMeter]) GetStartDate() time.Time {
	// First let's see if there is a last published event
	channel := make(chan *messagequeue.EventMessage)
	defer close(channel)

	retriever.EventMessageService.SubscribeValue(retriever.Meter.GetName(), retriever.GetMeterType(), channel)

	select {
	case message := <-channel:
		retriever.Logger.Info("Received event for", "meter", retriever.Meter.GetName(), "message", message)

		timestamp := message.GetTimestamp()
		nanoseconds := (timestamp % 1000) * 1_000_000
		return time.Unix(timestamp/1000, nanoseconds)

	case <-time.After(30 * time.Second):
		retriever.Logger.Info("Timeout waiting for messages")
	}

	// If no last published event, use the configured start date
	retriever.Logger.Info("No last published event found, using configured start date")
	days := retriever.Config.GetEnergyMonitorConfig().History

	return time.Now().AddDate(0, 0, -days)
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

package messagequeue

import (
	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/mqtt"
)

type EventMessage struct {
	mqtt.BaseMqttMessage

	Value float64 `json:"value"`
	Unit  string  `json:"unit"`
}

type EventMessageSubscriber interface {
	SubscribeValue(sensor string, action string, channel chan<- *EventMessage)
	UnsubscribeValue(sensor string, action string)
}

type EventMessagePublisher interface {
	PublishValue(sensor string, action string, value float64, unit string)
	PublishValueWithTime(sensor string, action string, value float64, unit string, timestamp *int64)
}

type EventMessageService interface {
	EventMessageSubscriber
	EventMessagePublisher
}

type eventMessageService struct {
	mqttService mqtt.MqttService
}

func NewEventMessageService(mqttService mqtt.MqttService) EventMessageService {
	return &eventMessageService{
		mqttService: mqttService,
	}
}

func (service eventMessageService) SubscribeValue(sensor string, action string, channel chan<- *EventMessage) {
	mqtt.Subscribe(service.mqttService, string(models.TopicEvent), sensor, action, true, channel)
}

func (service eventMessageService) UnsubscribeValue(sensor string, action string) {
	service.mqttService.Unsubscribe(string(models.TopicEvent), sensor, action)
}

func (service eventMessageService) PublishValue(sensor string, action string, value float64, unit string) {
	service.PublishValueWithTime(sensor, action, value, unit, nil)
}

func (service eventMessageService) PublishValueWithTime(
	sensor string,
	action string,
	value float64,
	unit string,
	timestamp *int64,
) {
	message := EventMessage{
		Value: value,
		Unit:  unit,
	}

	if timestamp != nil {
		message.SetTimestamp(*timestamp)
	}

	mqtt.Publish(service.mqttService, string(models.TopicEvent), sensor, action, &message)
}

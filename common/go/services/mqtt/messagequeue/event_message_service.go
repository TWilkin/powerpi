package messagequeue

import (
	"powerpi/common/services/mqtt"
)

type EventMessage struct {
	mqtt.BaseMqttMessage

	Value float64 `json:"value"`
	Unit  string  `json:"unit"`
}

type EventMessageService interface {
	PublishValue(sensor string, action string, value float64, unit string)

	PublishValueWithTime(sensor string, action string, value float64, unit string, timestamp *int64)
}

type eventMessageService struct {
	mqttService mqtt.MqttService
}

func NewEventMessageService(mqttService mqtt.MqttService) EventMessageService {
	return &eventMessageService{
		mqttService: mqttService,
	}
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

	mqtt.Publish(service.mqttService, "event", sensor, action, &message)
}

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
	message := EventMessage{
		Value: value,
		Unit:  unit,
	}

	mqtt.Publish(service.mqttService, "event", sensor, action, &message)
}

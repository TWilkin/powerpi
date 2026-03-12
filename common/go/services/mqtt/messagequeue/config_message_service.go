package messagequeue

import (
	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/mqtt"
)

const topicType = "config"

type ConfigMessage struct {
	mqtt.BaseMqttMessage

	Payload  map[string]any `json:"payload"`
	Checksum string         `json:"checksum"`
}

type ConfigErrorMessage struct {
	mqtt.BaseMqttMessage

	Message string `json:"message"`
}

type ConfigMessageSubscriber interface {
	SubscribeChange(config models.ConfigType, channel chan<- *ConfigMessage)
	UnsubscribeChange(config models.ConfigType)
}

type ConfigMessagePublisher interface {
	PublishError(config models.ConfigType, error string)
}

type ConfigMessageService interface {
	ConfigMessageSubscriber
	ConfigMessagePublisher
}

type configMessageService struct {
	mqttService mqtt.MqttService
}

func NewConfigMessageService(mqttService mqtt.MqttService) ConfigMessageService {
	return &configMessageService{
		mqttService: mqttService,
	}
}

func (service configMessageService) SubscribeChange(config models.ConfigType, channel chan<- *ConfigMessage) {
	mqtt.Subscribe(service.mqttService, topicType, string(config), string(models.ActionChange), true, channel)
}

func (service configMessageService) UnsubscribeChange(config models.ConfigType) {
	service.mqttService.Unsubscribe(topicType, string(config), string(models.ActionChange))
}

func (service configMessageService) PublishError(config models.ConfigType, error string) {
	message := ConfigErrorMessage{
		Message: error,
	}

	mqtt.Publish(service.mqttService, topicType, string(config), string(models.ActionError), &message)
}

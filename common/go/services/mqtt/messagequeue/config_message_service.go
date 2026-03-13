package messagequeue

import (
	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/mqtt"
)

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
	SubscribeChange2(device string, channel chan<- *ConfigMessage) // TODO replaces above
	UnsubscribeChange(config models.ConfigType)
	UnsubscribeChange2(device string) // TODO replaces above
}

type ConfigMessagePublisher interface {
	PublishDeviceConfig(device string, config map[string]any, checksum string)
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
	mqtt.Subscribe(service.mqttService, string(models.TopicConfig), string(config), string(models.ActionChange), true, channel)
}

func (service configMessageService) SubscribeChange2(device string, channel chan<- *ConfigMessage) {
	mqtt.Subscribe(service.mqttService, string(models.TopicConfig), device, string(models.ActionChange), true, channel)
}

func (service configMessageService) UnsubscribeChange(config models.ConfigType) {
	service.mqttService.Unsubscribe(string(models.TopicConfig), string(config), string(models.ActionChange))
}

func (service configMessageService) UnsubscribeChange2(device string) {
	service.mqttService.Unsubscribe(string(models.TopicConfig), device, string(models.ActionChange))
}

func (service configMessageService) PublishDeviceConfig(device string, config map[string]any, checksum string) {
	message := ConfigMessage{
		Payload:  config,
		Checksum: checksum,
	}

	mqtt.Publish(service.mqttService, string(models.TopicConfig), device, string(models.ActionChange), &message)
}

func (service configMessageService) PublishError(config models.ConfigType, err string) {
	message := ConfigErrorMessage{
		Message: err,
	}

	mqtt.Publish(service.mqttService, string(models.TopicConfig), string(config), string(models.ActionError), &message)
}

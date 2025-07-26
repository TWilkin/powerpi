package messagequeue

import (
	"powerpi/common/models"
	"powerpi/common/services/mqtt"
)

type ConfigMessage struct {
	mqtt.BaseMqttMessage

	Payload  map[string]any `json:"payload"`
	Checksum string         `json:"checksum"`
}

type ConfigMessageService interface {
	SubscribeChange(config models.ConfigType, channel chan<- *ConfigMessage)
	UnsubscribeChange(config models.ConfigType)
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
	mqtt.Subscribe(service.mqttService, "config", string(config), "change", true, channel)
}

func (service configMessageService) UnsubscribeChange(config models.ConfigType) {
	service.mqttService.Unsubscribe("config", string(config), "change")
}

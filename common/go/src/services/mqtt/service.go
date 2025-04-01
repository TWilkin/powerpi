package mqtt

import "powerpi/common/config"

type IMqttService interface {
	Connect(string, int, *string, *string)
}

type mqttService struct {
}

func NewMqttService(config config.MqttConfig, factory mqttClientFactory) *mqttService {
	return &mqttService{}
}

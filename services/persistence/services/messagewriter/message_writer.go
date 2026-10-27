package messagewriter

import "github.com/TWilkin/powerpi/common/services/mqtt"

type MessageWriterService interface {
	Start() error
}

type messageWriterService struct {
	mqttClient mqtt.MqttService
}

func NewMessageWriterService(mqttClient mqtt.MqttService) MessageWriterService {
	return &messageWriterService{
		mqttClient: mqttClient,
	}
}

func (writer *messageWriterService) Start() error {
	return nil
}

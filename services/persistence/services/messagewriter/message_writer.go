package messagewriter

import (
	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
)

type MessageWriterService interface {
	Start()
}

type messageWriterService struct {
	logger     logger.LoggerService
	mqttClient mqtt.MqttService

	channel chan *mqtt.BaseMqttMessage
}

func NewMessageWriterService(
	logger logger.LoggerService,
	mqttClient mqtt.MqttService,
) MessageWriterService {
	return &messageWriterService{
		logger:     logger,
		mqttClient: mqttClient,
	}
}

func (writer *messageWriterService) Start() {
	channel := make(chan *mqtt.BaseMqttMessage, 1)
	defer close(channel)
	writer.channel = channel

	mqtt.Subscribe(writer.mqttClient, "#", "", "", true, channel)

	for {
		message := <-writer.channel
		writer.logger.Info("Received message", "message", message)
	}
}

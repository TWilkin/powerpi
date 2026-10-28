package messagewriter

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/persistence/services/database"
)

type MessageWriterService interface {
	Start()
}

type messageWriterService struct {
	logger     logger.LoggerService
	mqttClient mqtt.MqttService
	database   database.DatabaseService

	channel chan *mqtt.BaseMqttMessage
}

func NewMessageWriterService(
	logger logger.LoggerService,
	mqttClient mqtt.MqttService,
	database database.DatabaseService,
) MessageWriterService {
	return &messageWriterService{
		logger:     logger,
		mqttClient: mqttClient,
		database:   database,
	}
}

func (writer *messageWriterService) Start() {
	channel := make(chan *mqtt.BaseMqttMessage, 1)
	defer close(channel)
	writer.channel = channel

	mqtt.Subscribe(writer.mqttClient, "#", "", "", true, channel)

	for {
		message := <-writer.channel

		err := writer.process(message)
		if err != nil {
			writer.logger.Error("Unable to write message", "error", err)
		}
	}
}

func (writer *messageWriterService) process(message *mqtt.BaseMqttMessage) error {
	raw := *new(map[string]any)
	if err := json.Unmarshal([]byte(message.GetRaw()), &raw); err != nil {
		return err
	}

	// remove the timestamp so we don't record it twice
	delete(raw, "timestamp")

	payload, err := json.Marshal(message)
	if err != nil {
		return err
	}

	writer.database.WriteMessage("a", "b", "c", message.Timestamp, payload)

	return nil
}

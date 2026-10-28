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
	channel := make(chan mqtt.MqttPayload[*mqtt.BaseMqttMessage], 1)
	defer close(channel)

	mqtt.Subscribe(writer.mqttClient, "#", "", "", true, channel)

	for {
		message := <-channel

		err := writer.process(message)
		if err != nil {
			writer.logger.Error("Unable to write message", "error", err)
		}
	}
}

func (writer *messageWriterService) process(message mqtt.MqttPayload[*mqtt.BaseMqttMessage]) error {
	raw := *new(map[string]any)
	if err := json.Unmarshal([]byte(message.GetRaw()), &raw); err != nil {
		return err
	}

	// remove the timestamp so we don't record it twice
	delete(raw, "timestamp")

	// payload, err := json.Marshal(message)
	// if err != nil {
	// 	return err
	// }

	writer.logger.Info(string(message.Raw))
	//writer.database.WriteMessage("a", "b", "c", message.Message.GetTimestamp(), payload)

	return nil
}

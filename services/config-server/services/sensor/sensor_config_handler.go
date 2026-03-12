package sensor

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/TWilkin/powerpi/common/services/logger"
	messageQueue "github.com/TWilkin/powerpi/common/services/mqtt/messagequeue"
)

type SensorConfigHandler interface {
	Publish(config map[string]any)
}

type sensorConfigHandler struct {
	logger       logger.LoggerService
	messageQueue messageQueue.ConfigMessageService
}

func NewSensorConfigHandler(logger logger.LoggerService, messageQueue messageQueue.ConfigMessageService) SensorConfigHandler {
	return &sensorConfigHandler{
		logger:       logger,
		messageQueue: messageQueue,
	}
}

func (handler sensorConfigHandler) Publish(config map[string]any) {
	handler.logger.Info("Identifying config for PowerPi sensors")

	// these are the keys we don't want to emit to the sensor
	omit := map[string]bool{
		"type":         true,
		"name":         true,
		"display_name": true,
		"location":     true,
		"metrics":      true,
		"visible":      true,
	}

	sensors, ok := config["sensors"].([]any)
	if !ok {
		return
	}

	for _, sensor := range sensors {
		entry, ok := sensor.(map[string]any)
		if !ok {
			continue
		}

		if entry["type"] != "powerpi" {
			continue
		}

		filtered := make(map[string]any)
		for key, value := range entry {
			if omit[key] {
				continue
			}

			filtered[key] = value
		}

		content, err := json.Marshal(filtered)
		if err != nil {
			handler.logger.Error("Could not parse config")
			continue
		}
		checksum := fmt.Sprintf("%x", sha256.Sum256([]byte(content)))

		name, ok := entry["name"].(string)
		if !ok {
			handler.logger.Error("Could not identify sensor name")
			continue
		}

		changed := handler.compareChecksum(name, checksum)

		if changed {
			handler.logger.Info("Publishing updated config for sensor", "sensor", name)

			handler.messageQueue.PublishDeviceConfig(name, filtered, checksum)
		} else {
			handler.logger.Info("Not publishing config as file is unchanged", "sensor", name)
		}
	}
}

func (handler sensorConfigHandler) compareChecksum(sensor string, checksum string) bool {
	channel := make(chan *messageQueue.ConfigMessage, 1)
	handler.messageQueue.SubscribeChange2(sensor, channel)

	defer handler.messageQueue.UnsubscribeChange2(sensor)

	select {
	case message := <-channel:
		if message.Checksum == checksum {
			handler.logger.Info("Read checksum", "sensor", sensor, "checksum", checksum)
			return false
		}

	case <-time.After(5 * time.Second):
		return true
	}

	return true
}

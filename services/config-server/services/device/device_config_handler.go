package device

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"

	"github.com/TWilkin/powerpi/common/services/logger"
	messageQueue "github.com/TWilkin/powerpi/common/services/mqtt/messagequeue"
)

type DeviceConfigHandler interface {
	Publish(config map[string]any)
}

type deviceConfigHandler struct {
	logger       logger.LoggerService
	messageQueue messageQueue.ConfigMessageService
}

func NewDeviceConfigHandler(logger logger.LoggerService, messageQueue messageQueue.ConfigMessageService) DeviceConfigHandler {
	return &deviceConfigHandler{
		logger:       logger,
		messageQueue: messageQueue,
	}
}

func (handler deviceConfigHandler) Publish(config map[string]any) {
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

		handler.logger.Info("Publishing updated config for sensor", "sensor", name)

		handler.messageQueue.PublishDeviceConfig(name, filtered, checksum)
	}
}

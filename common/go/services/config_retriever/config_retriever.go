package config

import (
	"powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"sync"
	"time"
)

type ConfigRetriever interface {
	GetConfig()
}

type configRetriever struct {
	configService config.ConfigService
	mqttService   mqtt.MqttService
	logger        logger.LoggerService
}

func NewConfigRetriever(configService config.ConfigService, mqttService mqtt.MqttService, logger logger.LoggerService) ConfigRetriever {
	return &configRetriever{configService: configService, mqttService: mqttService, logger: logger}
}

func (retriever *configRetriever) GetConfig() {
	requiredConfigType := retriever.configService.RequiredConfig()

	var wait sync.WaitGroup
	wait.Add(len(requiredConfigType))

	var mutex sync.Mutex

	go func() {
		defer wait.Done()

		for _, configType := range requiredConfigType {
			// Subscribe to the config change for this type
			channel := make(chan *mqtt.ConfigMessage)
			retriever.mqttService.SubscribeConfigChange(configType, channel)

			select {
			case message := <-channel:
				retriever.logger.Info("Received config change for", "configType", configType)

				// Process the message
				mutex.Lock()
				retriever.configService.SetConfig(configType, message.Payload, message.Checksum)
				mutex.Unlock()

			case <-time.After(2 * time.Minute):
				retriever.logger.Error("Timeout waiting for config", "configType", configType)
			}

			close(channel)
		}
	}()

	wait.Wait()

	retriever.logger.Info("All required config retrieved")
}

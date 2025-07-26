package configretriever

import (
	"sync"
	"time"

	"powerpi/common/models"
	"powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt/messagequeue"
)

type ConfigRetriever interface {
	WaitForConfig()
}

type configRetriever struct {
	configService  config.ConfigService
	messageService messagequeue.ConfigMessageService
	logger         logger.LoggerService
}

func NewConfigRetriever(configService config.ConfigService, messageService messagequeue.ConfigMessageService, logger logger.LoggerService) ConfigRetriever {
	return &configRetriever{configService: configService, messageService: messageService, logger: logger}
}

func (retriever *configRetriever) WaitForConfig() {
	requiredConfigType := retriever.configService.RequiredConfig()
	if len(requiredConfigType) == 0 {
		retriever.logger.Info("No required config to retrieve")
		return
	}

	var group sync.WaitGroup
	group.Add(len(requiredConfigType))

	var mutex sync.Mutex

	waitForConfig := func(configType models.ConfigType) {
		defer group.Done()

		// Subscribe to the config change for this type
		channel := make(chan *messagequeue.ConfigMessage)
		retriever.messageService.SubscribeChange(configType, channel)
		defer retriever.messageService.UnsubscribeChange(configType)
		defer close(channel)

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
	}

	for _, configType := range requiredConfigType {
		go waitForConfig(configType)
	}

	group.Wait()

	retriever.logger.Info("All required config retrieved")
}

package services

import (
	"go.uber.org/dig"

	"powerpi/common/services/clock"
	"powerpi/common/services/config"
	configRetriever "powerpi/common/services/config_retriever"
	"powerpi/common/services/http"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/common/services/mqtt/messagequeue"
)

type CommonContainer interface {
	Container() *dig.Container

	SetConfigService(configService config.ConfigService)
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() CommonContainer {
	container := dig.New()

	container.Provide(clock.NewClockService)
	container.Provide(configRetriever.NewConfigRetriever)
	container.Provide(logger.NewLoggerService)

	container.Provide(func() http.HTTPClientFactory {
		return http.NewHTTPClientFactory()
	})

	container.Provide(mqtt.NewMqttService)
	container.Provide(messagequeue.NewDeviceMessageService)
	container.Provide(messagequeue.NewConfigMessageService)

	container.Provide(func() mqtt.MqttClientFactory {
		return mqtt.NewMqttClientFactory()
	})

	return commonContainer{container}
}

func (container commonContainer) Container() *dig.Container {
	return container.container
}

func (container commonContainer) SetConfigService(configService config.ConfigService) {
	err := container.container.Provide(func() config.ConfigService {
		return configService
	})

	if err != nil {
		panic(err)
	}
}

func GetService[TService any, TContainer CommonContainer](container TContainer) TService {
	var service TService

	err := container.Container().Invoke(func(newService TService) {
		service = newService
	})

	if err != nil {
		panic(err)
	}

	return service
}

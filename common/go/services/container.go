package services

import (
	"go.uber.org/dig"

	"powerpi/common/services/clock"
	"powerpi/common/services/config"
	"powerpi/common/services/mqtt"
)

type CommonContainer interface {
	Container() *dig.Container
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() CommonContainer {
	container := dig.New()

	container.Provide(clock.NewClockService)
	container.Provide(config.NewConfigService)

	container.Provide(mqtt.NewMqttService)

	container.Provide(func() mqtt.MqttClientFactory {
		return mqtt.NewMqttClientFactory()
	})

	return commonContainer{container}
}

func (container commonContainer) Container() *dig.Container {
	return container.container
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

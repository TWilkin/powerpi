package services

import (
	"go.uber.org/dig"

	"powerpi/common/services/clock"
	"powerpi/common/services/config"
	"powerpi/common/services/mqtt"
)

type CommonContainer interface {
	Container() *dig.Container

	ConfigService() config.ConfigService
	MqttService() mqtt.MqttService
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() *commonContainer {
	container := dig.New()

	container.Provide(clock.NewClockService)
	container.Provide(config.NewConfigService)

	container.Provide(mqtt.NewMqttService)

	container.Provide(func() mqtt.MqttClientFactory {
		return mqtt.NewMqttClientFactory()
	})

	return &commonContainer{container}
}

func (container commonContainer) Container() *dig.Container {
	return container.container
}

func (container commonContainer) ConfigService() config.ConfigService {
	var configService *config.ConfigService

	err := container.container.Invoke(func(service *config.ConfigService) {
		configService = service
	})

	if err != nil {
		panic(err)
	}

	return *configService
}

func (container commonContainer) MqttService() mqtt.MqttService {
	var mqttService *mqtt.MqttService

	err := container.container.Invoke(func(service *mqtt.MqttService) {
		mqttService = service
	})

	if err != nil {
		panic(err)
	}

	return *mqttService
}

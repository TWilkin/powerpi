package container

import (
	"go.uber.org/dig"

	"powerpi/common/services/clock"
	"powerpi/common/services/mqtt"
)

type CommonContainer interface {
	MqttService() mqtt.MqttService
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() *commonContainer {
	container := dig.New()

	container.Provide(clock.NewClockService)

	container.Provide(mqtt.NewMqttService)

	container.Provide(func() mqtt.MqttClientFactory {
		return mqtt.NewMqttClientFactory()
	})

	return &commonContainer{container}
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

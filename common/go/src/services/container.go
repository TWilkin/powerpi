package container

import (
	"go.uber.org/dig"

	"powerpi/common/services/mqtt"
)

type ICommonContainer interface {
	MqttClient() mqtt.IMqttService
	MqttFactory() mqtt.MqttClientFactory
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() *commonContainer {
	container := dig.New()

	container.Provide(mqtt.NewMqttService)

	container.Provide(func() mqtt.MqttClientFactory {
		return mqtt.NewMqttClientFactory()
	})

	return &commonContainer{container}
}

func (container commonContainer) MqttService() mqtt.IMqttService {
	var mqttService *mqtt.IMqttService

	err := container.container.Invoke(func(service *mqtt.IMqttService) {
		mqttService = service
	})

	if err != nil {
		panic(err)
	}

	return *mqttService
}

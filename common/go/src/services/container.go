package container

import (
	"go.uber.org/dig"

	"powerpi/common/services/mqtt"
)

type ICommonContainer interface {
	MqttService() mqtt.IMqttClient
}

type commonContainer struct {
	container *dig.Container
}

func NewCommonContainer() *commonContainer {
	container := dig.New()

	err := container.Provide(mqtt.NewMqttClient)

	if err != nil {
		panic(err)
	}

	return &commonContainer{container}
}

func (container commonContainer) MqttService() mqtt.IMqttClient {
	var mqttService *mqtt.IMqttClient

	err := container.container.Invoke(func(service *mqtt.IMqttClient) {
		mqttService = service
	})

	if err != nil {
		panic(err)
	}

	return *mqttService
}

package mqtt

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type MqttClientFactory interface {
	BuildClient(options *mqtt.ClientOptions) mqtt.Client
}

type mqttClientFactory struct {
}

func NewMqttClientFactory() MqttClientFactory {
	return mqttClientFactory{}
}

func (factory mqttClientFactory) BuildClient(options *mqtt.ClientOptions) mqtt.Client {
	return mqtt.NewClient(options)
}

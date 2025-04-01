package mqtt

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
)

type MqttClientFactory interface {
	BuildClient(options *MQTT.ClientOptions) MQTT.Client
}

type mqttClientFactory struct {
}

func NewMqttClientFactory() MqttClientFactory {
	return mqttClientFactory{}
}

func (factory mqttClientFactory) BuildClient(options *MQTT.ClientOptions) MQTT.Client {
	return MQTT.NewClient(options)
}

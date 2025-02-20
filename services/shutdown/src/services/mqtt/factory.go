package mqtt

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
)

type IMqttClientFactory interface {
	BuildClient(options *MQTT.ClientOptions) MQTT.Client
}

type MqttClientFactory struct {
}

func (factory MqttClientFactory) BuildClient(options *MQTT.ClientOptions) MQTT.Client {
	return MQTT.NewClient(options)
}

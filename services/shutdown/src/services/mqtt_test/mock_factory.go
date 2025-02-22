package mqtt_test

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
)

type MockFactory struct {
}

func (factory MockFactory) BuildClient(options *MQTT.ClientOptions) MQTT.Client {
	return &MockMqttClient{}
}

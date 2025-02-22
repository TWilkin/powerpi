package mqtt_test

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"
)

type MockMqttClient struct {
	mock.Mock
}

func (client *MockMqttClient) AddRoute(topic string, callback MQTT.MessageHandler) {
	client.Called(topic, callback)
}

func (client *MockMqttClient) Connect() MQTT.Token {
	args := client.Called()
	return args.Get(0).(MQTT.Token)
}

func (client *MockMqttClient) Disconnect(quiesce uint) {
	client.Called(quiesce)
}

func (client *MockMqttClient) IsConnected() bool {
	args := client.Called()
	return args.Bool(0)
}

func (client *MockMqttClient) IsConnectionOpen() bool {
	args := client.Called()
	return args.Bool(0)
}

func (client *MockMqttClient) OptionsReader() MQTT.ClientOptionsReader {
	args := client.Called()
	return args.Get(0).(MQTT.ClientOptionsReader)
}

func (client *MockMqttClient) Publish(topic string, qos byte, retained bool, payload interface{}) MQTT.Token {
	args := client.Called(topic, qos, retained, payload)
	return args.Get(0).(MQTT.Token)
}

func (client *MockMqttClient) Subscribe(topic string, qos byte, callback MQTT.MessageHandler) MQTT.Token {
	args := client.Called(topic, qos, callback)
	return args.Get(0).(MQTT.Token)
}

func (client *MockMqttClient) SubscribeMultiple(filters map[string]byte, callback MQTT.MessageHandler) MQTT.Token {
	args := client.Called(filters, callback)
	return args.Get(0).(MQTT.Token)
}

func (client *MockMqttClient) Unsubscribe(topics ...string) MQTT.Token {
	args := client.Called(topics)
	return args.Get(0).(MQTT.Token)
}

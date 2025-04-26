package mqtt_test

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"
)

type MockPahoMqttClient struct {
	mock.Mock
}

func (client *MockPahoMqttClient) AddRoute(topic string, callback MQTT.MessageHandler) {
	client.Called(topic, callback)
}

func (client *MockPahoMqttClient) Connect() MQTT.Token {
	args := client.Called()
	return args.Get(0).(MQTT.Token)
}

func (client *MockPahoMqttClient) Disconnect(quiesce uint) {
	client.Called(quiesce)
}

func (client *MockPahoMqttClient) IsConnected() bool {
	args := client.Called()
	return args.Bool(0)
}

func (client *MockPahoMqttClient) IsConnectionOpen() bool {
	args := client.Called()
	return args.Bool(0)
}

func (client *MockPahoMqttClient) OptionsReader() MQTT.ClientOptionsReader {
	args := client.Called()
	return args.Get(0).(MQTT.ClientOptionsReader)
}

func (client *MockPahoMqttClient) Publish(
	topic string,
	qos byte,
	retained bool,
	payload interface{},
) MQTT.Token {
	args := client.Called(topic, qos, retained, payload)
	return args.Get(0).(MQTT.Token)
}

func (client *MockPahoMqttClient) Subscribe(
	topic string,
	qos byte,
	callback MQTT.MessageHandler,
) MQTT.Token {
	args := client.Called(topic, qos, callback)
	return args.Get(0).(MQTT.Token)
}

func (client *MockPahoMqttClient) SubscribeMultiple(
	filters map[string]byte,
	callback MQTT.MessageHandler,
) MQTT.Token {
	args := client.Called(filters, callback)
	return args.Get(0).(MQTT.Token)
}

func (client *MockPahoMqttClient) Unsubscribe(topics ...string) MQTT.Token {
	args := client.Called(topics)
	return args.Get(0).(MQTT.Token)
}

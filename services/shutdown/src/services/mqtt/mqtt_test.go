package mqtt

import (
	"strings"
	"testing"

	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"

	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/utils"
)

type MockMqttClient struct {
	mock.Mock
}

func (client *MockMqttClient) AddRoute(topic string, callback MQTT.MessageHandler) {
	panic("unimplemented")
}

func (client *MockMqttClient) Connect() MQTT.Token {
	panic("unimplemented")
}

func (client *MockMqttClient) Disconnect(quiesce uint) {
	panic("unimplemented")
}

func (client *MockMqttClient) IsConnected() bool {
	panic("unimplemented")
}

func (client *MockMqttClient) IsConnectionOpen() bool {
	panic("unimplemented")
}

func (client *MockMqttClient) OptionsReader() MQTT.ClientOptionsReader {
	panic("unimplemented")
}

func (client *MockMqttClient) Publish(topic string, qos byte, retained bool, payload interface{}) MQTT.Token {
	client.Called(topic, qos, retained, payload)

	return &MQTT.PublishToken{}
}

func (client *MockMqttClient) Subscribe(topic string, qos byte, callback MQTT.MessageHandler) MQTT.Token {
	panic("unimplemented")
}

func (client *MockMqttClient) SubscribeMultiple(filters map[string]byte, callback MQTT.MessageHandler) MQTT.Token {
	panic("unimplemented")
}

func (client *MockMqttClient) Unsubscribe(topics ...string) MQTT.Token {
	panic("unimplemented")
}

type MockFactory struct {
}

func (factory MockFactory) BuildClient(options *MQTT.ClientOptions) MQTT.Client {
	return &MockMqttClient{}
}

func TestPublishState(t *testing.T) {
	var tests = []struct {
		name            string
		state           DeviceState
		additionalState additional.AdditionalState
		expected        string
	}{
		{"off", Off, additional.AdditionalState{}, "\"state\":\"off\""},
		{"on", On, additional.AdditionalState{}, "\"state\":\"on\""},
		{"off with brightness", Off, additional.AdditionalState{Brightness: utils.ToPtr(50)}, "\"brightness\":50"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config := flags.MqttConfig{TopicBase: "powerpi"}
			subject := newClient(config, MockFactory{}, nil, "MyDevice", nil)

			client := &MockMqttClient{}
			subject.client = client

			client.On(
				"Publish",
				"powerpi/device/MyDevice/status",
				byte(2),
				true,
				mock.MatchedBy(func(payload []byte) bool {
					return strings.Contains(string(payload), test.expected)
				}),
			).Return(&MQTT.PublishToken{})

			subject.PublishState(test.state, test.additionalState)

			client.AssertExpectations(t)
		})
	}
}

func TestPublishCapability(t *testing.T) {
	var tests = []struct {
		name     string
		config   flags.AdditionalStateConfig
		expected *string
	}{
		{
			"brightness on",
			flags.AdditionalStateConfig{
				Brightness: flags.BrightnessConfig{Device: "/device", Min: 0, Max: 100},
			},
			utils.ToPtr("\"brightness\":true"),
		},
		{
			"brightness off",
			flags.AdditionalStateConfig{},
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config := flags.MqttConfig{TopicBase: "powerpi"}
			subject := newClient(config, MockFactory{}, nil, "MyDevice", nil)

			client := &MockMqttClient{}
			subject.client = client

			if test.expected != nil {
				client.On(
					"Publish",
					"powerpi/device/MyDevice/capability",
					byte(2),
					true,
					mock.MatchedBy(func(payload []byte) bool {
						return strings.Contains(string(payload), *test.expected)
					}),
				).Return(&MQTT.PublishToken{})

				subject.publishCapability(test.config)

				client.AssertExpectations(t)
			} else {
				client.AssertNotCalled(t, "Publish")
			}
		})
	}
}

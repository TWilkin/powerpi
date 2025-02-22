package mqtt

import (
	"fmt"
	"strings"
	"testing"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/assert"
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

type MockMessage struct {
	mock.Mock
}

func (message MockMessage) Ack() {
	panic("unimplemented")
}

func (message MockMessage) Duplicate() bool {
	panic("unimplemented")
}

func (message MockMessage) MessageID() uint16 {
	panic("unimplemented")
}

func (message *MockMessage) Payload() []byte {
	args := message.Called()
	return args.Get(0).([]byte)
}

func (message MockMessage) Qos() byte {
	panic("unimplemented")
}

func (message MockMessage) Retained() bool {
	panic("unimplemented")
}

func (message *MockMessage) Topic() string {
	args := message.Called()
	return args.String(0)
}

type MockClock struct{}

func (clock MockClock) Now() time.Time {
	return time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
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
			subject := newClient(config, MockFactory{}, nil, MockClock{}, "MyDevice", nil)

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
			subject := newClient(config, MockFactory{}, nil, MockClock{}, "MyDevice", nil)

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

func TestOnMessageReceived(t *testing.T) {
	var tests = []struct {
		name               string
		payload            string
		timestamp          *time.Time
		expectedState      *DeviceState
		expectedAdditional *additional.AdditionalState
	}{
		{
			"on",
			"{\"state\":\"on\", %s}",
			nil,
			utils.ToPtr(On),
			&additional.AdditionalState{},
		},
		{
			"off",
			"{\"state\":\"off\", %s}",
			nil,
			utils.ToPtr(Off),
			&additional.AdditionalState{},
		},
		{
			"brightness",
			"{\"state\":\"off\", \"brightness\":50, %s}",
			nil,
			utils.ToPtr(Off),
			&additional.AdditionalState{Brightness: utils.ToPtr(50)},
		},
		{
			"too old",
			"{\"state\":\"off\", %s}",
			utils.ToPtr(time.Date(2025, 2, 22, 0, 0, 0, 0, time.UTC)),
			nil,
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config := flags.MqttConfig{TopicBase: "powerpi"}

			var receivedState *DeviceState
			var receivedAdditionalState *additional.AdditionalState
			action := func(client MqttClient, state DeviceState, additionalState additional.AdditionalState) {
				receivedState = &state
				receivedAdditionalState = &additionalState
			}

			subject := newClient(config, MockFactory{}, nil, MockClock{}, "MyDevice", action)

			client := &MockMqttClient{}
			subject.client = client

			timestamp := time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
			if test.timestamp != nil {
				timestamp = *test.timestamp
			}

			payload := fmt.Sprintf(test.payload, fmt.Sprintf("\"timestamp\":%d", timestamp.Unix()*1000))

			message := &MockMessage{}
			message.On("Topic").Return("powerpi/device/MyDevice/change")
			message.On("Payload").Return([]byte(payload))

			subject.onMessageReceived(message)

			message.AssertExpectations(t)

			assert.Equal(t, test.expectedState, receivedState)
			assert.Equal(t, test.expectedAdditional, receivedAdditionalState)
		})
	}
}

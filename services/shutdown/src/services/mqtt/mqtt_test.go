package mqtt

import (
	"fmt"
	"strings"
	"testing"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"powerpi/shutdown/models"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional_test"
	"powerpi/shutdown/services/clock_test"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/services/mqtt_test"
	"powerpi/shutdown/utils"
)

func TestConnect(t *testing.T) {
	var tests = []struct {
		name            string
		port            int
		username        string
		password        string
		expectedAddress string
	}{
		{
			"tcp",
			1883,
			"",
			"",
			"tcp://mqtt-host:1883",
		},
		{
			"tcps",
			8883,
			"",
			"",
			"tcps://mqtt-host:8883",
		},
		{
			"auth",
			8883,
			"user",
			"password",
			"tcps://mqtt-host:8883",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config := flags.MqttConfig{TopicBase: "powerpi"}
			factory := &mqtt_test.MockFactory{}
			subject := newClient(config, factory, nil, clock_test.MockClock{}, "MyDevice", nil)

			client := &mqtt_test.MockPahoMqttClient{}
			factory.On("BuildClient", mock.MatchedBy(func(options *MQTT.ClientOptions) bool {
				return options.Servers[0].String() == test.expectedAddress &&
					options.Username == test.username &&
					options.Password == test.password &&
					options.ClientID == "shutdown-MyDevice"
			})).Return(client)

			token := &mqtt_test.MockToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)
			client.On("Connect").Return(token)

			var user *string = &test.username
			if test.username == "" {
				user = nil
			}

			var password *string = &test.password
			if test.password == "" {
				password = nil
			}

			subject.Connect("mqtt-host", test.port, user, password, flags.Config{})
		})
	}
}

func TestPublishState(t *testing.T) {
	var tests = []struct {
		name            string
		state           models.DeviceState
		additionalState additional.AdditionalState
		expected        string
	}{
		{"off", models.Off, additional.AdditionalState{}, "\"state\":\"off\""},
		{"on", models.On, additional.AdditionalState{}, "\"state\":\"on\""},
		{"off with brightness", models.Off, additional.AdditionalState{Brightness: utils.ToPtr(50)}, "\"brightness\":50"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config := flags.MqttConfig{TopicBase: "powerpi"}
			subject := newClient(config, nil, nil, clock_test.MockClock{}, "MyDevice", nil)

			client := &mqtt_test.MockPahoMqttClient{}
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
			subject := newClient(config, nil, nil, clock_test.MockClock{}, "MyDevice", nil)

			client := &mqtt_test.MockPahoMqttClient{}
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

func TestOnConnect(t *testing.T) {
	additionalService := &additional_test.MockAdditionalStateService{}
	config := flags.MqttConfig{TopicBase: "powerpi"}
	subject := newClient(config, nil, additionalService, clock_test.MockClock{}, "MyDevice", nil)

	client := &mqtt_test.MockPahoMqttClient{}
	subject.client = client

	client.On(
		"Publish",
		"powerpi/device/MyDevice/status",
		byte(2),
		true,
		mock.MatchedBy(func(payload []byte) bool {
			return strings.Contains(string(payload), "\"state\":\"on\"")
		})).Return(&MQTT.PublishToken{})

	client.On(
		"Publish",
		"powerpi/device/MyDevice/capability",
		byte(2),
		true,
		mock.MatchedBy(func(payload []byte) bool {
			return strings.Contains(string(payload), "\"brightness\":true")
		})).Return(&MQTT.PublishToken{})

	token := &mqtt_test.MockToken{}
	token.On("Wait").Return(true)
	token.On("Error").Return(nil)
	client.On("Subscribe", "powerpi/device/MyDevice/change", byte(2), mock.Anything).Return(token)

	additionalService.On("GetAdditionalState").Return(additional.AdditionalState{})

	subject.onConnect(flags.Config{AdditionalState: flags.AdditionalStateConfig{Brightness: flags.BrightnessConfig{Device: "/device", Min: 0, Max: 100}}})
}

func TestOnMessageReceived(t *testing.T) {
	var tests = []struct {
		name               string
		payload            string
		timestamp          *time.Time
		expectedState      *models.DeviceState
		expectedAdditional *additional.AdditionalState
	}{
		{
			"on",
			"{\"state\":\"on\", %s}",
			nil,
			utils.ToPtr(models.On),
			&additional.AdditionalState{},
		},
		{
			"off",
			"{\"state\":\"off\", %s}",
			nil,
			utils.ToPtr(models.Off),
			&additional.AdditionalState{},
		},
		{
			"brightness",
			"{\"state\":\"off\", \"brightness\":50, %s}",
			nil,
			utils.ToPtr(models.Off),
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

			var receivedState *models.DeviceState
			var receivedAdditionalState *additional.AdditionalState
			action := func(
				client IMqttClient,
				state models.DeviceState,
				additionalState additional.AdditionalState,
			) {
				receivedState = &state
				receivedAdditionalState = &additionalState
			}

			subject := newClient(config, nil, nil, clock_test.MockClock{}, "MyDevice", action)

			client := &mqtt_test.MockPahoMqttClient{}
			subject.client = client

			timestamp := time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
			if test.timestamp != nil {
				timestamp = *test.timestamp
			}

			payload := fmt.Sprintf(test.payload, fmt.Sprintf("\"timestamp\":%d", timestamp.Unix()*1000))

			message := &mqtt_test.MockMessage{}
			message.On("Topic").Return("powerpi/device/MyDevice/change")
			message.On("Payload").Return([]byte(payload))

			subject.onMessageReceived(message)

			message.AssertExpectations(t)

			assert.Equal(t, test.expectedState, receivedState)
			assert.Equal(t, test.expectedAdditional, receivedAdditionalState)
		})
	}
}

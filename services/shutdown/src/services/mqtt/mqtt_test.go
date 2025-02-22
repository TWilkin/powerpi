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
	"powerpi/shutdown/services/clock_test"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/services/mqtt_test"
	"powerpi/shutdown/utils"
)

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
			subject := newClient(config, mqtt_test.MockFactory{}, nil, clock_test.MockClock{}, "MyDevice", nil)

			client := &mqtt_test.MockMqttClient{}
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
			subject := newClient(config, mqtt_test.MockFactory{}, nil, clock_test.MockClock{}, "MyDevice", nil)

			client := &mqtt_test.MockMqttClient{}
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
			action := func(client IMqttClient, state DeviceState, additionalState additional.AdditionalState) {
				receivedState = &state
				receivedAdditionalState = &additionalState
			}

			subject := newClient(config, mqtt_test.MockFactory{}, nil, clock_test.MockClock{}, "MyDevice", action)

			client := &mqtt_test.MockMqttClient{}
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

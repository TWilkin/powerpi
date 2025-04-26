package mqtt

import (
	"fmt"
	"powerpi/common/config"
	"powerpi/common/models"
	"powerpi/common/services/clock"
	"powerpi/common/utils"
	"strings"
	"testing"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type TestMessage struct {
	BaseMqttMessage
	State      models.DeviceState `json:"state"`
	Brightness *int               `json:"brightness,omitempty"`
}

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
			config := config.MqttConfig{TopicBase: "powerpi"}
			factory := &MockMqttClientFactory{}

			client := &MockPahoMqttClient{}
			factory.On("BuildClient", mock.MatchedBy(func(options *mqtt.ClientOptions) bool {
				return options.Servers[0].String() == test.expectedAddress &&
					options.Username == test.username &&
					options.Password == test.password &&
					strings.HasPrefix(options.ClientID, "test-client-")
			})).Return(client)

			token := &MockMqttClientToken{}
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

			subject := NewMqttService(config, factory, clock.MockClockService{})
			subject.Connect("mqtt-host", test.port, user, password, "test-client")
		})
	}
}

func TestPublish(t *testing.T) {
	var tests = []struct {
		name              string
		timestamp         int64
		expectedTimestamp string
	}{
		{
			"timestamp set",
			1234567890000,
			"1234567890000",
		},
		{
			"timestamp not set",
			0,
			"1740182520000",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client := &MockPahoMqttClient{}

			subject := &mqttService{
				client:    client,
				clock:     clock.MockClockService{},
				topicBase: "powerpi",
			}

			token := &MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			client.On(
				"Publish",
				"powerpi/device/MyDevice/status",
				byte(2),
				true,
				mock.MatchedBy(func(payload []byte) bool {
					return strings.Contains(string(payload), "\"state\":\"on\"") &&
						strings.Contains(string(payload), "\"timestamp\":"+test.expectedTimestamp)
				}),
			).Return(token)

			message := TestMessage{
				State: models.On,
			}
			if test.timestamp != 0 {
				message.SetTimestamp(test.timestamp)
			}

			Publish(*subject, "device", "MyDevice", "status", &message)
		})
	}
}

func TestPublishDeviceState(t *testing.T) {
	var tests = []struct {
		name            string
		state           models.DeviceState
		additionalState *models.AdditionalState
		expected        string
	}{
		{"off", models.Off, nil, "\"state\":\"off\""},
		{"on", models.On, &models.AdditionalState{}, "\"state\":\"on\""},
		{"off with brightness", models.Off, &models.AdditionalState{Brightness: utils.ToPtr(50)}, "\"brightness\":50"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client := &MockPahoMqttClient{}

			subject := &mqttService{
				client:    client,
				clock:     clock.MockClockService{},
				topicBase: "powerpi",
			}

			token := &MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			client.On(
				"Publish",
				"powerpi/device/MyDevice/status",
				byte(2),
				true,
				mock.MatchedBy(func(payload []byte) bool {
					return strings.Contains(string(payload), test.expected)
				}),
			).Return(token)

			subject.PublishDeviceState("MyDevice", test.state, test.additionalState)

			client.AssertExpectations(t)
		})
	}
}

func TestPublishCapability(t *testing.T) {
	var tests = []struct {
		name       string
		capability models.Capability
		expected   *string
	}{
		{
			"brightness on",
			models.Capability{
				Brightness: true,
			},
			utils.ToPtr("\"brightness\":true"),
		},
		{
			"brightness off",
			models.Capability{
				Brightness: false,
			},
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client := &MockPahoMqttClient{}

			subject := &mqttService{
				client:    client,
				clock:     clock.MockClockService{},
				topicBase: "powerpi",
			}

			token := &MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			if test.expected != nil {
				client.On(
					"Publish",
					"powerpi/device/MyDevice/capability",
					byte(2),
					true,
					mock.MatchedBy(func(payload []byte) bool {
						return strings.Contains(string(payload), *test.expected)
					}),
				).Return(token)

				subject.PublishCapability("MyDevice", test.capability)

				client.AssertExpectations(t)
			} else {
				client.AssertNotCalled(t, "Publish")
			}
		})
	}
}

func TestSubscribe(t *testing.T) {
	var tests = []struct {
		name               string
		payload            string
		timestamp          *time.Time
		expectedState      *models.DeviceState
		expectedAdditional *models.AdditionalState
	}{
		{
			"on",
			"{\"state\":\"on\", %s}",
			nil,
			utils.ToPtr(models.On),
			&models.AdditionalState{},
		},
		{
			"off",
			"{\"state\":\"off\", %s}",
			nil,
			utils.ToPtr(models.Off),
			&models.AdditionalState{},
		},
		{
			"brightness",
			"{\"state\":\"off\", \"brightness\":50, %s}",
			nil,
			utils.ToPtr(models.Off),
			&models.AdditionalState{Brightness: utils.ToPtr(50)},
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
			client := &MockPahoMqttClient{}

			subject := mqttService{
				client:    client,
				clock:     clock.MockClockService{},
				topicBase: "powerpi",
			}

			token := &MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			var messageCallback mqtt.MessageHandler

			client.On(
				"Subscribe",
				"powerpi/device/MyDevice/change",
				byte(2),
				mock.MatchedBy(func(callback mqtt.MessageHandler) bool {
					messageCallback = callback
					return true
				}),
			).Return(token)

			channel := make(chan *TestMessage, 1)

			Subscribe(subject, "device", "MyDevice", "change", channel)

			timestamp := time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)
			if test.timestamp != nil {
				timestamp = *test.timestamp
			}

			payload := fmt.Sprintf(test.payload, fmt.Sprintf("\"timestamp\":%d", timestamp.Unix()*1000))

			message := &MockMqttClientMessage{}
			message.On("Topic").Return("powerpi/device/MyDevice/change")
			message.On("Payload").Return([]byte(payload))

			messageCallback(subject.client, message)

			if test.expectedState == nil {
				// For "too old" case we expect no message to be received
				select {
				case msg := <-channel:
					t.Errorf("Expected no message, but got: %v", msg)
				case <-time.After(100 * time.Millisecond):
					// Success - no message received within timeout
					return
				}
			}

			// For valid messages, we expect to receive them
			receivedMessage := <-channel
			close(channel)

			message.AssertExpectations(t)

			assert.Equal(t, receivedMessage, &TestMessage{
				BaseMqttMessage: BaseMqttMessage{
					Timestamp: timestamp.Unix() * 1000,
				},
				State:      *test.expectedState,
				Brightness: test.expectedAdditional.Brightness,
			})

		})
	}
}

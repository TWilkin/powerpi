package mqtt

import (
	"powerpi/common/config"
	"powerpi/common/services/clock"
	"strings"
	"testing"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"
)

type TestMessage struct {
	BaseMqttMessage
	Payload string `json:"payload"`
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
			factory := MockMqttClientFactory{}

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
			config := config.MqttConfig{TopicBase: "powerpi"}

			subject := NewMqttService(config, nil, clock.MockClockService{})

			client := &MockPahoMqttClient{}
			subject.client = client

			token := &MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			client.On(
				"Publish",
				"powerpi/device/MyDevice/status",
				byte(2),
				true,
				mock.MatchedBy(func(payload []byte) bool {
					return strings.Contains(string(payload), "\"payload\":\"test\"") &&
						strings.Contains(string(payload), "\"timestamp\":"+test.expectedTimestamp)
				}),
			).Return(token)

			message := TestMessage{
				Payload: "test",
			}
			if test.timestamp != 0 {
				message.SetTimestamp(test.timestamp)
			}

			Publish(*subject, "device", "MyDevice", "status", &message)
		})
	}
}

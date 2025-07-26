package messagequeue

import (
	"fmt"
	"strings"
	"testing"
	"time"

	pahomqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
	"powerpi/common/services/clock"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/common/utils"
)

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
			client := &mqtt.MockPahoMqttClient{}

			mqttService := &mqtt.MockMqttService{}
			mqttService.On("getClient").Return(client)
			mqttService.On("getClock").Return(clock.MockClockService{})
			mqttService.On("getLogger").Return(logger.SetupMockLoggerService())

			topic := "powerpi/device/MyDevice/status"
			mqttService.On("topic", "device", "MyDevice", "status").Return(topic)

			subject := NewDeviceMessageService(mqttService)

			token := &mqtt.MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			client.On(
				"Publish",
				topic,
				byte(2),
				true,
				mock.MatchedBy(func(payload []byte) bool {
					return strings.Contains(string(payload), test.expected)
				}),
			).Return(token)

			subject.PublishState("MyDevice", test.state, test.additionalState)

			client.AssertExpectations(t)
		})
	}
}

func TestPublishDeviceCapability(t *testing.T) {
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
			client := &mqtt.MockPahoMqttClient{}

			mqttService := &mqtt.MockMqttService{}
			mqttService.On("getClient").Return(client)
			mqttService.On("getClock").Return(clock.MockClockService{})
			mqttService.On("getLogger").Return(logger.SetupMockLoggerService())

			topic := "powerpi/device/MyDevice/capability"
			mqttService.On("topic", "device", "MyDevice", "capability").Return(topic)

			subject := NewDeviceMessageService(mqttService)

			token := &mqtt.MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			if test.expected != nil {
				client.On(
					"Publish",
					topic,
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

func TestSubscribeDeviceChange(t *testing.T) {
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
			client := &mqtt.MockPahoMqttClient{}

			mqttService := &mqtt.MockMqttService{}
			mqttService.On("getClient").Return(client)
			mqttService.On("getClock").Return(clock.MockClockService{})
			mqttService.On("getLogger").Return(logger.SetupMockLoggerService())

			topic := "powerpi/device/MyDevice/change"
			mqttService.On("topic", "device", "MyDevice", "change").Return(topic)

			subject := NewDeviceMessageService(mqttService)

			token := &mqtt.MockMqttClientToken{}
			token.On("Wait").Return(true)
			token.On("Error").Return(nil)

			var messageCallback pahomqtt.MessageHandler

			client.On(
				"Subscribe",
				topic,
				byte(2),
				mock.MatchedBy(func(callback pahomqtt.MessageHandler) bool {
					messageCallback = callback
					return true
				}),
			).Return(token)

			channel := make(chan *DeviceMessage, 1)

			subject.SubscribeChange("MyDevice", channel)

			timestamp := time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)

			payload := fmt.Sprintf("{\"state\":\"on\", \"brightness\": 50, \"timestamp\":%d}", timestamp.Unix()*1000)

			message := &mqtt.MockMqttClientMessage{}
			message.On("Topic").Return(topic)
			message.On("Payload").Return([]byte(payload))

			messageCallback(client, message)

			receivedMessage := <-channel
			close(channel)

			message.AssertExpectations(t)

			assert.Equal(t, receivedMessage, &DeviceMessage{
				BaseMqttMessage: mqtt.BaseMqttMessage{
					Timestamp: timestamp.Unix() * 1000,
				},
				AdditionalState: models.AdditionalState{
					Brightness: utils.ToPtr(50),
				},
				State: models.On,
			})
		})
	}
}

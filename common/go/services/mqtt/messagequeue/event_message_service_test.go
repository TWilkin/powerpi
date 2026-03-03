package messagequeue

import (
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/mock"

	"powerpi/common/services/clock"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
)

func TestPublishEventValue(t *testing.T) {
	var tests = []struct {
		name     string
		action   string
		value    float64
		unit     string
		expected string
	}{
		{"positive", "power", 10, "kWh", "\"value\":10,\"unit\":\"kWh\""},
		{"negative", "power", -10, "kWh", "\"value\":-10,\"unit\":\"kWh\""},
		{"decimal", "temperature", 12.3, "°C", "\"value\":12.3,\"unit\":\"°C\""},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			client := &mqtt.MockPahoMqttClient{}

			mqttService := &mqtt.MockMqttService{}
			mqttService.On("getClient").Return(client)
			mqttService.On("getClock").Return(clock.MockClockService{})
			mqttService.On("getLogger").Return(logger.SetupMockLoggerService())

			topic := fmt.Sprintf("powerpi/event/MySensor/%s", test.action)
			mqttService.On("topic", "event", "MySensor", test.action).Return(topic)

			subject := NewEventMessageService(mqttService)

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

			subject.PublishValue("MySensor", test.action, test.value, test.unit)

			client.AssertExpectations(t)
		})
	}
}

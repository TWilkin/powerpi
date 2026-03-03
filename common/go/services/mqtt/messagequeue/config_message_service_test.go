package messagequeue

import (
	"fmt"
	"testing"
	"time"

	pahomqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
	"powerpi/common/services/clock"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
)

func TestSubscribeConfigChange(t *testing.T) {
	client := &mqtt.MockPahoMqttClient{}

	mqttService := &mqtt.MockMqttService{}
	mqttService.On("getClient").Return(client)
	mqttService.On("getClock").Return(clock.MockClockService{})
	mqttService.On("getLogger").Return(logger.SetupMockLoggerService())

	topic := "powerpi/config/devices/change"
	mqttService.On("topic", "config", "devices", "change").Return(topic)

	subject := NewConfigMessageService(mqttService)

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

	channel := make(chan *ConfigMessage, 1)

	subject.SubscribeChange(models.ConfigTypeDevices, channel)

	timestamp := time.Date(2025, 2, 22, 0, 2, 0, 0, time.UTC)

	payload := fmt.Sprintf("{\"payload\":{\"devices\":[], \"sensors\":[]}, \"checksum\":\"123\", \"timestamp\":%d}", timestamp.Unix()*1000)

	message := &mqtt.MockMqttClientMessage{}
	message.On("Topic").Return(topic)
	message.On("Payload").Return([]byte(payload))

	messageCallback(client, message)

	receivedMessage := <-channel
	close(channel)

	message.AssertExpectations(t)

	assert.Equal(t, receivedMessage, &ConfigMessage{
		BaseMqttMessage: mqtt.BaseMqttMessage{
			Timestamp: timestamp.Unix() * 1000,
		},
		Payload:  map[string]interface{}{"devices": []interface{}{}, "sensors": []interface{}{}},
		Checksum: "123",
	})
}

package mqtt

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"

	"powerpi/common/services/clock"
	"powerpi/common/services/logger"
)

type MockMqttService struct {
	mock.Mock
}

func (service *MockMqttService) Connect(clientIdPrefix string) {
	service.Called(clientIdPrefix)
}

func (service *MockMqttService) Join() {
	service.Called()
}

func (service *MockMqttService) topic(typ string, entity string, action string) string {
	args := service.Called(typ, entity, action)
	return args.String(0)
}

func (service *MockMqttService) getClock() clock.ClockService {
	args := service.Called()
	return args.Get(0).(clock.ClockService)
}

func (service *MockMqttService) getLogger() logger.LoggerService {
	args := service.Called()
	return args.Get(0).(logger.LoggerService)
}

func (service *MockMqttService) getClient() mqtt.Client {
	args := service.Called()
	return args.Get(0).(mqtt.Client)
}

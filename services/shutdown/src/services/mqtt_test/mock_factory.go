package mqtt_test

import (
	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"
)

type MockFactory struct {
	mock.Mock
}

func (factory *MockFactory) BuildClient(options *MQTT.ClientOptions) MQTT.Client {
	args := factory.Called(options)
	return args.Get(0).(MQTT.Client)
}

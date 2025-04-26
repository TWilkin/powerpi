package mqtt

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/stretchr/testify/mock"
)

type MockMqttClientFactory struct {
	mock.Mock
}

func (factory MockMqttClientFactory) BuildClient(options *mqtt.ClientOptions) mqtt.Client {
	args := factory.Called(options)
	return args.Get(0).(mqtt.Client)
}

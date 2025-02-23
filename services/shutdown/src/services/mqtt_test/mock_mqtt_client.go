package mqtt_test

import (
	"github.com/stretchr/testify/mock"

	"powerpi/shutdown/models"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/flags"
)

type MockMqttClient struct {
	mock.Mock
}

func (client *MockMqttClient) Connect(
	host string,
	port int,
	user *string,
	password *string,
	config flags.Config,
) {
	client.Called(host, port, user, password, config)
}

func (client *MockMqttClient) PublishState(
	state models.DeviceState,
	additionalState additional.AdditionalState,
) {
	client.Called(state, additionalState)
}

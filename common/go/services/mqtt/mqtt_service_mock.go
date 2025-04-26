package mqtt

import (
	"powerpi/common/models"

	"github.com/stretchr/testify/mock"
)

type MockMqttService struct {
	mock.Mock
}

func (service *MockMqttService) Connect(
	host string,
	port int,
	user *string,
	password *string,
	clientIdPrefix string,
) {
	service.Called(host, port, user, password)
}

func (service *MockMqttService) Join() {
	service.Called()
}

func (service *MockMqttService) PublishDeviceState(
	device string,
	state models.DeviceState,
	additionalState *models.AdditionalState,
) {
	service.Called(device, state, additionalState)
}

func (service *MockMqttService) PublishCapability(device string, capability models.Capability,
) {
	service.Called(device, capability)
}

func (service *MockMqttService) SubscribeDeviceChange(device string, channel chan<- *DeviceMessage) {
	service.Called(device, channel)
}

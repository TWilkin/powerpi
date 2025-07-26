package messagequeue

import (
	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
)

type MockDeviceMessageService struct {
	mock.Mock
}

func (service *MockDeviceMessageService) PublishState(
	device string,
	state models.DeviceState,
	additionalState *models.AdditionalState,
) {
	service.Called(device, state, additionalState)
}

func (service *MockDeviceMessageService) PublishCapability(device string, capability models.Capability) {
	service.Called(device, capability)
}

func (service *MockDeviceMessageService) SubscribeChange(device string, channel chan<- *DeviceMessage) {
	service.Called(device, channel)
}

func (service *MockDeviceMessageService) UnsubscribeChange(device string) {
	service.Called(device)
}

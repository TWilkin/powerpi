package messagequeue

import (
	"github.com/stretchr/testify/mock"

	"github.com/TWilkin/powerpi/common/models"
)

type MockConfigMessageService struct {
	mock.Mock
}

func (service *MockConfigMessageService) SubscribeChange(config models.ConfigType, channel chan<- *ConfigMessage) {
	service.Called(config, channel)
}

func (service *MockConfigMessageService) UnsubscribeChange(config models.ConfigType) {
	service.Called(config)
}

func (service *MockConfigMessageService) SubscribeChange2(device string, channel chan<- *ConfigMessage) {
	service.Called(device, channel)
}

func (service *MockConfigMessageService) UnsubscribeChange2(device string) {
	service.Called(device)
}

func (service *MockConfigMessageService) PublishDeviceConfig(device string, config map[string]any, checksum string) {
	service.Called(device, config, checksum)
}

func (service *MockConfigMessageService) PublishError(config models.ConfigType, err string) {
	service.Called(config, err)
}

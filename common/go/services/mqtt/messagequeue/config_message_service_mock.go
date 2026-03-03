package messagequeue

import (
	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
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

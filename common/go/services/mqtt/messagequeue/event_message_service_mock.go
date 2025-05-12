package messagequeue

import (
	"github.com/stretchr/testify/mock"
)

type MockEventMessageService struct {
	mock.Mock
}

func (service *MockEventMessageService) PublishValue(
	sensor string,
	action string,
	value float64,
	unit string,
) {
	service.Called(sensor, action, value, unit)
}

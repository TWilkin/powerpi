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

func (service *MockEventMessageService) PublishValueWithTime(
	sensor string,
	action string,
	value float64,
	unit string,
	timestamp *int64,
) {
	service.Called(sensor, action, value, unit, timestamp)
}

func (service *MockEventMessageService) SubscribeValue(sensor string, action string, channel chan<- *EventMessage) {
	service.Called(sensor, action, channel)
}

func (service *MockEventMessageService) UnsubscribeValue(sensor string, action string) {
	service.Called(sensor, action)
}

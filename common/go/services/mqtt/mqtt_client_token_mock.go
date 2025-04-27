package mqtt

import (
	"time"

	"github.com/stretchr/testify/mock"
)

type MockMqttClientToken struct {
	mock.Mock
}

func (token *MockMqttClientToken) Wait() bool {
	args := token.Called()
	return args.Bool(0)
}

func (token *MockMqttClientToken) WaitTimeout(timeout time.Duration) bool {
	args := token.Called(timeout)
	return args.Bool(0)
}

func (token *MockMqttClientToken) Done() <-chan struct{} {
	args := token.Called()
	return args.Get(0).(<-chan struct{})
}

func (token *MockMqttClientToken) Error() error {
	args := token.Called()
	return args.Error(0)
}

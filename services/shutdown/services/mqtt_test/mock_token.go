package mqtt_test

import (
	"time"

	"github.com/stretchr/testify/mock"
)

type MockToken struct {
	mock.Mock
}

func (token *MockToken) Wait() bool {
	args := token.Called()
	return args.Bool(0)
}

func (token *MockToken) WaitTimeout(timeout time.Duration) bool {
	args := token.Called(timeout)
	return args.Bool(0)
}

func (token *MockToken) Done() <-chan struct{} {
	args := token.Called()
	return args.Get(0).(<-chan struct{})
}

func (token *MockToken) Error() error {
	args := token.Called()
	return args.Error(0)
}

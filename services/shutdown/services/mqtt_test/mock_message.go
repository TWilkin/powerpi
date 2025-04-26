package mqtt_test

import "github.com/stretchr/testify/mock"

type MockMessage struct {
	mock.Mock
}

func (message *MockMessage) Ack() {
	message.Called()
}

func (message *MockMessage) Duplicate() bool {
	args := message.Called()
	return args.Bool(0)
}

func (message *MockMessage) MessageID() uint16 {
	args := message.Called()
	return args.Get(0).(uint16)
}

func (message *MockMessage) Payload() []byte {
	args := message.Called()
	return args.Get(0).([]byte)
}

func (message *MockMessage) Qos() byte {
	args := message.Called()
	return args.Get(0).(byte)
}

func (message *MockMessage) Retained() bool {
	args := message.Called()
	return args.Bool(0)
}

func (message *MockMessage) Topic() string {
	args := message.Called()
	return args.String(0)
}

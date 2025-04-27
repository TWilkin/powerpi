package mqtt

import "github.com/stretchr/testify/mock"

type MockMqttClientMessage struct {
	mock.Mock
}

func (message *MockMqttClientMessage) Ack() {
	message.Called()
}

func (message *MockMqttClientMessage) Duplicate() bool {
	args := message.Called()
	return args.Bool(0)
}

func (message *MockMqttClientMessage) MessageID() uint16 {
	args := message.Called()
	return args.Get(0).(uint16)
}

func (message *MockMqttClientMessage) Payload() []byte {
	args := message.Called()
	return args.Get(0).([]byte)
}

func (message *MockMqttClientMessage) Qos() byte {
	args := message.Called()
	return args.Get(0).(byte)
}

func (message *MockMqttClientMessage) Retained() bool {
	args := message.Called()
	return args.Bool(0)
}

func (message *MockMqttClientMessage) Topic() string {
	args := message.Called()
	return args.String(0)
}

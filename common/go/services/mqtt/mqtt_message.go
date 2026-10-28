package mqtt

type MqttMessage interface {
	GetTimestamp() int64
	SetTimestamp(value int64)
}

type BaseMqttMessage struct {
	Timestamp int64 `json:"timestamp"`
}

type MqttMessagePointer interface {
	MqttMessage
}

func (message *BaseMqttMessage) GetTimestamp() int64 {
	return message.Timestamp
}

func (message *BaseMqttMessage) SetTimestamp(value int64) {
	message.Timestamp = value
}

package mqtt

type mqttMessage interface {
	GetTimestamp() int64
	SetTimestamp(value int64)

	GetRaw() []byte
	SetRaw(value []byte)
}

type BaseMqttMessage struct {
	Timestamp int64  `json:"timestamp"`
	Raw       []byte `json:"_"`
}

func (message *BaseMqttMessage) GetTimestamp() int64 {
	return message.Timestamp
}

func (message *BaseMqttMessage) SetTimestamp(value int64) {
	message.Timestamp = value
}

func (message *BaseMqttMessage) GetRaw() []byte {
	return message.Raw
}

func (message *BaseMqttMessage) SetRaw(value []byte) {
	message.Raw = value
}

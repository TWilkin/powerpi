package mqtt

type mqttMessage interface {
	GetTimestamp() int64
	SetTimestamp(value int64)

	GetRaw() string
	SetRaw(value string)
}

type BaseMqttMessage struct {
	Timestamp int64  `json:"timestamp"`
	Raw       string `json:"_"`
}

func (message *BaseMqttMessage) GetTimestamp() int64 {
	return message.Timestamp
}

func (message *BaseMqttMessage) SetTimestamp(value int64) {
	message.Timestamp = value
}

func (message *BaseMqttMessage) GetRaw() string {
	return message.Raw
}

func (message *BaseMqttMessage) SetRaw(value string) {
	message.Raw = value
}

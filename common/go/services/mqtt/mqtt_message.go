package mqtt

import "powerpi/common/models"

type mqttMessage interface {
	GetTimestamp() int64
	SetTimestamp(value int64)
}

type BaseMqttMessage struct {
	Timestamp int64 `json:"timestamp"`
}

func (message *BaseMqttMessage) GetTimestamp() int64 {
	return message.Timestamp
}

func (message *BaseMqttMessage) SetTimestamp(value int64) {
	message.Timestamp = value
}

type ConfigMessage struct {
	BaseMqttMessage

	Payload  string `json:"payload"`
	Checksum string `json:"checksum"`
}

type DeviceMessage struct {
	BaseMqttMessage
	models.AdditionalState

	State models.DeviceState `json:"state"`
}

type CapabilityMessage struct {
	BaseMqttMessage
	models.Capability
}

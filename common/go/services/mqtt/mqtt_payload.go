package mqtt

import "strings"

type mqttPayload[TMessage MqttMessage] interface {
	GetMessage() TMessage
	GetRaw() []byte
	GetTopic() (string, string, string)
}

type MqttPayload[TMessage MqttMessage] struct {
	Message TMessage
	Raw     []byte
	Topic   string
}

func NewMqttPayload[TMessage MqttMessage](
	message TMessage,
	raw []byte,
	topic string,
) MqttPayload[TMessage] {
	return MqttPayload[TMessage]{
		Message: message,
		Raw:     raw,
		Topic:   topic,
	}
}

func (payload *MqttPayload[TMessage]) GetMessage() TMessage {
	return payload.Message
}

func (payload *MqttPayload[TMessage]) GetRaw() []byte {
	return payload.Raw
}

func (payload *MqttPayload[TMessage]) GetTopic() (string, string, string) {
	split := strings.Split(payload.Topic, "/")

	return split[1], split[2], split[3]
}

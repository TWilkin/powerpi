package messagequeue

import "github.com/TWilkin/powerpi/common/services/mqtt"

func unwrap[TMessage mqtt.MqttMessage](in chan mqtt.MqttPayload[TMessage], out chan<- TMessage) {
	defer close(in)

	payload := <-in

	message := payload.Message

	out <- message
}

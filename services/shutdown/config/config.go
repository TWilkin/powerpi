package config

import (
	"fmt"
	"os"
)

func Hostname() (hostname string) {
	hostname, err := os.Hostname()

	if err != nil {
		panic(err)
	}

	return
}

func MqttAddress() (mqtt_address string) {
	mqtt_address = os.Getenv("MQTT_ADDRESS")
	return
}

func MqttClientId() (client_id string) {
	client_id = fmt.Sprintf("shutdown-%s", Hostname())
	return
}

func MqttTopicBase() (topic_base string) {
	topic_base = os.Getenv("TOPIC_BASE")

	if topic_base == "" {
		topic_base = "powerpi"
	}

	return
}

package config

import (
	"fmt"
	"os"
)

func MqttAddress() (mqtt_address string) {
	mqtt_address = os.Getenv("MQTT_ADDRESS")
	return
}

func MqttClientId() (client_id string) {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}
	
	client_id = fmt.Sprintf("shutdown-%s", hostname)
	return
}

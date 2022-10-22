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

func MqttClientId() (client_id string) {
	client_id = fmt.Sprintf("shutdown-%s", Hostname())
	return
}

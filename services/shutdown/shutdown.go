package main

import (
	"fmt"

	"github.com/eclipse/paho.mqtt.golang"

	"powerpi/shutdown/config"
)

func main() {
	fmt.Println("PowerPi Shutdown Service")

	// connect to MQTT
	fmt.Printf("Connecting to MQTT at %s as %s", config.MqttAddress(), config.MqttClientId())
	fmt.Println()
	mqtt_options := mqtt.NewClientOptions().AddBroker(config.MqttAddress()).SetClientID(config.MqttClientId())
	mqtt_client := mqtt.NewClient(mqtt_options)

	if token := mqtt_client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	mqtt_client.Disconnect(250)
}

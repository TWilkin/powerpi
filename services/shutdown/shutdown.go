package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/eclipse/paho.mqtt.golang"

	"powerpi/shutdown/config"
)

func main() {
	fmt.Println("PowerPi Shutdown Service")

	// make the channel
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// set the MQTT options
	mqtt_options := mqtt.NewClientOptions()
	mqtt_options.AddBroker(config.MqttAddress())
	mqtt_options.SetClientID(config.MqttClientId())
	mqtt_options.SetCleanSession(true)
	mqtt_options.OnConnect = onConnect

	// connect to MQTT
	fmt.Printf("Connecting to MQTT at %s as %s\n", config.MqttAddress(), config.MqttClientId())
	mqttClient := mqtt.NewClient(mqtt_options)

	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// join the channel
	<-c

	mqttClient.Disconnect(250)
}

func onConnect(mqttClient mqtt.Client) {
	fmt.Println("Connected to MQTT")

	// subscribe to the shutdown event for this device
	topic := fmt.Sprintf("%s/device/%s/change", config.MqttTopicBase(), config.Hostname())
	fmt.Printf("Subscribing to %s\n", topic)

	if token := mqttClient.Subscribe(topic, 2, onMessageReceived); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func onMessageReceived(mqttClient mqtt.Client, message mqtt.Message) {
	fmt.Printf("Received %s: %s\n", message.Topic(), message.Payload())
}

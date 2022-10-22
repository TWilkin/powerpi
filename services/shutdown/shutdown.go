package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/eclipse/paho.mqtt.golang"

	"powerpi/shutdown/config"
)

type DeviceChangeMessage struct {
	State string
	Timestamp int64
}


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

	data := []byte(message.Payload())
	var payload DeviceChangeMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		fmt.Println("Could not decode JSON message")
		return
	}

	// check if the message is old
	twoMinsAgo := time.Now().Unix() - 2 * 60
	if twoMinsAgo >= (payload.Timestamp / 1000) {
		fmt.Println("Ignoring old message")
		return
	}

	// if it's not old and an off command, shutdown
	if payload.State == "off" {
		fmt.Println("Initiating shutdown")
		os.Exit(0)
	}
}

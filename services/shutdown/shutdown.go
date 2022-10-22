package main

import (
	"encoding/json"
	"flag"
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

	// use command line args
	mqttHost := flag.String("host", "localhost", "The hostname of the MQTT broker")
	mqttPort := flag.Int("port", 1883, "The port number for the MQTT broker")
	mqttTopicBase := flag.String("topic", "powerpi", "The topic base for the MQTT broker")
	flag.Parse()

	// make the channel
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// set the MQTT options
	mqttAddress := fmt.Sprintf("tcp://%s:%d", *mqttHost, *mqttPort)
	mqtt_options := mqtt.NewClientOptions()
	mqtt_options.AddBroker(mqttAddress)
	mqtt_options.SetClientID(config.MqttClientId())
	mqtt_options.SetCleanSession(true)
	mqtt_options.OnConnect = func(mqttClient mqtt.Client) { onConnect(mqttClient, *mqttTopicBase) }

	// connect to MQTT
	fmt.Printf("Connecting to MQTT at %s as %s\n", mqttAddress, config.MqttClientId())
	mqttClient := mqtt.NewClient(mqtt_options)

	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// join the channel
	<-c

	mqttClient.Disconnect(250)
}

func onConnect(mqttClient mqtt.Client, topicBase string) {
	fmt.Println("Connected to MQTT")

	// subscribe to the shutdown event for this device
	topic := fmt.Sprintf("%s/device/%s/change", topicBase, config.Hostname())
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

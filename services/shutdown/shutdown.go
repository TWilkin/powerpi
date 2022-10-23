package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"github.com/eclipse/paho.mqtt.golang"
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
	mock := flag.Bool("mock", false, "Whether to actually shutdown or not")
	flag.Parse()

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	// make the channel
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// set the MQTT options
	mqttAddress := fmt.Sprintf("tcp://%s:%d", *mqttHost, *mqttPort)
	mqttClientId := fmt.Sprintf("shutdown-%s", hostname)
	mqtt_options := mqtt.NewClientOptions()
	mqtt_options.AddBroker(mqttAddress)
	mqtt_options.SetClientID(mqttClientId)
	mqtt_options.SetCleanSession(true)
	mqtt_options.OnConnect = func(mqttClient mqtt.Client) { onConnect(mqttClient, hostname, *mqttTopicBase, *mock) }

	// connect to MQTT
	fmt.Printf("Connecting to MQTT at %s as %s\n", mqttAddress, mqttClientId)
	mqttClient := mqtt.NewClient(mqtt_options)

	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// join the channel
	<-c

	mqttClient.Disconnect(250)
}

func onConnect(mqttClient mqtt.Client, hostname string, topicBase string, mock bool) {
	fmt.Println("Connected to MQTT")

	// subscribe to the shutdown event for this device
	topic := fmt.Sprintf("%s/device/%s/change", topicBase, hostname)
	fmt.Printf("Subscribing to %s\n", topic)

	callback := func(mqttClient mqtt.Client, message mqtt.Message) {
		onMessageReceived(mqttClient, message, mock)
	}

	if token := mqttClient.Subscribe(topic, 2, callback); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func onMessageReceived(mqttClient mqtt.Client, message mqtt.Message, mock bool) {
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

		if !mock {
			err := exec.Command("shutdown").Run()
			if err != nil {
				fmt.Println("Failed to shutdown:", err)
			}
		}

		os.Exit(0)
	}
}

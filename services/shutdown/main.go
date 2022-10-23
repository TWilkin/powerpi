package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"powerpi/shutdown/mqtt"
)

var Version = "development"


func main() {
	fmt.Printf("PowerPi Shutdown Service %s\n", Version)

	// use command line args
	host := flag.String("host", "localhost", "The hostname of the MQTT broker")
	port := flag.Int("port", 1883, "The port number for the MQTT broker")
	topicBase := flag.String("topic", "powerpi", "The topic base for the MQTT broker")
	mock := flag.Bool("mock", false, "Whether to actually shutdown or not")
	flag.Parse()

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	// make the channel
	channel := make(chan os.Signal, 1)
	signal.Notify(channel, os.Interrupt, syscall.SIGTERM)

	// connect to MQTT
	callback := func(client mqtt.MqttClient, state mqtt.DeviceState) {
		shutdown(client, state, *mock)
	} 
	client := mqtt.New(hostname, *topicBase, callback)
	client.Connect(*host, *port)

	// join the channel
	<-channel
}

func shutdown(client mqtt.MqttClient, state mqtt.DeviceState, mock bool) {
	fmt.Println("Initiating shutdown")

	// publish the off message and wait to make sure it's sent
	client.PublishState(mqtt.Off)
	time.Sleep(time.Second)

	// turn off the computer if we're not mocking
	if !mock {
		err := exec.Command("shutdown").Run()
		if err != nil {
			fmt.Println("Failed to shutdown:", err)
		}
	}

	// nothing else to do so quit now
	os.Exit(0)
}

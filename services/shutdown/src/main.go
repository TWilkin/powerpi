package main

import (
	"flag"
	"fmt"
	"log"
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
	user := flag.String("user", "device", "The username for the MQTT broker")
	passwordFile := flag.String("password", "undefined", "The path to the password file")
	topicBase := flag.String("topic", "powerpi", "The topic base for the MQTT broker")
	mock := flag.Bool("mock", false, "Whether to actually shutdown or not")
	allowQuickShutdown := flag.Bool("allowQuickShutdown", false, "If true allow a message within 2 minutes of service starting to initiate a shutdown")
	flag.Parse()

	// capture the start time, or clear it if we're not allowing quick shutdown
	var startTime = time.Now()
	if *allowQuickShutdown {
		startTime = time.Time{}
	}

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	// read the password from the file (if set)
	password := getPassword(passwordFile)

	// make the channel
	channel := make(chan os.Signal, 1)
	signal.Notify(channel, os.Interrupt, syscall.SIGTERM)

	// connect to MQTT
	callback := func(client mqtt.MqttClient, state mqtt.DeviceState) {
		shutdown(client, state, *mock, startTime)
	} 
	client := mqtt.New(hostname, *topicBase, callback)
	client.Connect(*host, *port, user, password)

	// join the channel
	<-channel
}

func shutdown(client mqtt.MqttClient, state mqtt.DeviceState, mock bool, startTime time.Time) {
	// don't shutdown if the service has only just started
	if (time.Now().Unix() - startTime.Unix()) <= 2 * 60 {
		fmt.Println("Ignoring message as service recently started")
		return
	}

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
}

func getPassword(passwordFile *string) *string {
	var password *string
	password = nil

	if passwordFile != nil && *passwordFile != "undefined" {
		// check the password file permissions
		info, err := os.Stat(*passwordFile)
		if err != nil {
			panic(err)
		}

		permissions := info.Mode().Perm()
		if permissions != 0o600 {
			log.Fatalf("Incorrect permissions (0%o), must be 0600 on '%s'", permissions, *passwordFile)
		}

		data, err := os.ReadFile(*passwordFile)
		if err != nil {
			panic(err)
		}

		str := string(data)
		password = &str
	}

	return password
}
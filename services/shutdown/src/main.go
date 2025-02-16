package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"powerpi/shutdown/additional"
	"powerpi/shutdown/flags"
	"powerpi/shutdown/mqtt"
)

var Version = "development"


func main() {
	fmt.Printf("PowerPi Shutdown Service %s\n", Version)

	// use command line args
	config := flags.ParseFlags()

	// capture the start time, or clear it if we're not allowing quick shutdown
	var startTime = time.Now()
	if config.AllowQuickShutdown {
		startTime = time.Time{}
	}

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	// read the password from the file (if set)
	password := getPassword(config.Mqtt.PasswordFile)

	// make the channel
	channel := make(chan os.Signal, 1)
	signal.Notify(channel, os.Interrupt, syscall.SIGTERM)

	// connect to MQTT
	callback := func(client mqtt.MqttClient, state mqtt.DeviceState, additionalState additional.AdditionalState) {
		updateState(client, state, additionalState, config, startTime)
	} 
	client := mqtt.New(hostname, config.Mqtt.TopicBase, callback)
	client.Connect(config.Mqtt.Host, config.Mqtt.Port, &config.Mqtt.User, password, config)

	// join the channel
	<-channel
}

func updateState(client mqtt.MqttClient, state mqtt.DeviceState, additionalState additional.AdditionalState, config flags.Config, startTime time.Time) {
	// update any additional state
	currentAdditionalState := additional.GetAdditionalState(config.AdditionalState)
	additional.SetAdditionalState(config.AdditionalState, additionalState)

	newState := mqtt.On
	if (state == "off") {
		newState = mqtt.Off
	}

	// publish the state message if necessary
	if newState != mqtt.On || !additional.CompareAdditionalState(currentAdditionalState, additionalState) {
		client.PublishState(newState, additional.GetAdditionalState(config.AdditionalState))
	}

	if (state == "off") {
		// don't shutdown if the service has only just started
		if (time.Now().Unix() - startTime.Unix()) <= 2 * 60 {
			fmt.Println("Ignoring message as service recently started")
			return
		}

		// wait to make sure the publish message is sent
		time.Sleep(time.Second)

		fmt.Println("Initiating shutdown")

		// turn off the computer if we're not mocking
		if !config.Mock {
			err := exec.Command("shutdown").Run()
			if err != nil {
				fmt.Println("Failed to shutdown:", err)
			}
		}
	} else {
		fmt.Println("Ignoring message as it was not an off command")
	}
}

func getPassword(passwordFile string) *string {
	var password *string
	password = nil

	if passwordFile != "undefined" {
		// check the password file permissions
		info, err := os.Stat(passwordFile)
		if err != nil {
			panic(err)
		}

		permissions := info.Mode().Perm()
		if permissions != 0o600 {
			log.Fatalf("Incorrect permissions (0%o), must be 0600 on '%s'", permissions, passwordFile)
		}

		data, err := os.ReadFile(passwordFile)
		if err != nil {
			panic(err)
		}

		str := string(data)
		str = strings.TrimSpace(str)
		password = &str
	}

	return password
}
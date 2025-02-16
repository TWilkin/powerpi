package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"powerpi/shutdown/additional"
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
	brightness := flag.String("brightness", "", "The type of brightness device, e.g. pi-touch-display-2 if supported by this device")
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

	// generate the additional state device config
	var brightnessDevice *string = nil
	if brightness != nil && len(*brightness) > 0 {
		brightnessDevice = brightness
	}
	device := additional.AdditionalStateDevice{brightnessDevice}

	// read the password from the file (if set)
	password := getPassword(passwordFile)

	// make the channel
	channel := make(chan os.Signal, 1)
	signal.Notify(channel, os.Interrupt, syscall.SIGTERM)

	// connect to MQTT
	callback := func(client mqtt.MqttClient, state mqtt.DeviceState, additionalState additional.AdditionalState) {
		updateState(client, state, additionalState, *mock, device, startTime)
	} 
	client := mqtt.New(hostname, *topicBase, callback)
	client.Connect(*host, *port, user, password, device)

	// join the channel
	<-channel
}

func updateState(client mqtt.MqttClient, state mqtt.DeviceState, additionalState additional.AdditionalState, mock bool, device additional.AdditionalStateDevice, startTime time.Time) {
	// update any additional state
	currentAdditionalState := additional.GetAdditionalState(device)
	additional.SetAdditionalState(device, additionalState)

	newState := mqtt.On
	if (state == "off") {
		newState = mqtt.Off
	}

	// publish the state message if necessary
	if newState != mqtt.On || !additional.CompareAdditionalState(currentAdditionalState, additionalState) {
		client.PublishState(newState, additional.GetAdditionalState(device))
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
		if !mock {
			err := exec.Command("shutdown").Run()
			if err != nil {
				fmt.Println("Failed to shutdown:", err)
			}
		}
	} else {
		fmt.Println("Ignoring message as it was not an off command")
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
		str = strings.TrimSpace(str)
		password = &str
	}

	return password
}
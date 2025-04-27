package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"

	"powerpi/common/models"
	"powerpi/common/services/clock"
	"powerpi/common/services/mqtt"
	"powerpi/shutdown/config"
	"powerpi/shutdown/services"
	"powerpi/shutdown/services/additional"
	configService "powerpi/shutdown/services/config"
)

var Version = "development"

func main() {
	fmt.Printf("PowerPi Shutdown Service %s\n", Version)

	// setup the services
	container := services.NewShutdownContainer()

	// use command line args
	configService := services.GetService[configService.ConfigService](container)
	configService.Parse(os.Args)
	config := configService.Config()

	// capture the start time, or clear it if we're not allowing quick shutdown
	var startTime = time.Now()
	if config.AllowQuickShutdown {
		startTime = time.Time{}
	}

	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	// get the additional state service
	additionalStateService := services.GetService[additional.AdditionalStateService](container)

	// read the password from the file (if set)
	mqttConfig := configService.MqttConfig()
	password := getPassword(mqttConfig.PasswordFile)

	// connect to MQTT
	mqttService := services.GetService[mqtt.MqttService](container)
	mqttService.Connect(mqttConfig.Host, mqttConfig.Port, &mqttConfig.User, password, "shutdown")

	// publish the initial state
	publishState(mqttService, additionalStateService, hostname, config)

	// subscribe to the change event
	channel := make(chan *mqtt.DeviceMessage, 1)
	mqttService.SubscribeDeviceChange(hostname, channel)

	// loop waiting for messages
	clockService := services.GetService[clock.ClockService](container)
	for {
		message := <-channel

		updateState(additionalStateService, mqttService, clockService, config, hostname, message.State, message.AdditionalState, startTime)
	}
}

func publishState(
	mqttService mqtt.MqttService,
	additionalStateService additional.AdditionalStateService,
	hostname string,
	config config.Config,
) {
	// publish the initial state
	currentAdditionalState := additionalStateService.GetAdditionalState()

	mqttService.PublishDeviceState(hostname, models.On, &currentAdditionalState)

	// publish the capabilities
	if len(config.AdditionalState.Brightness.Device) > 0 {
		capabilities := models.Capability{
			Brightness: true,
		}

		mqttService.PublishCapability(hostname, capabilities)
	}
}

func updateState(
	additionalStateService additional.AdditionalStateService,
	mqttService mqtt.MqttService,
	clockService clock.ClockService,
	config config.Config,
	hostname string,
	state models.DeviceState,
	additionalState models.AdditionalState,
	startTime time.Time,
) {
	// update any additional state
	currentAdditionalState := additionalStateService.GetAdditionalState()
	additionalStateService.SetAdditionalState(additionalState)

	newState := models.On
	if state == "off" {
		newState = models.Off

		// don't shutdown if the service has only just started
		if !config.AllowQuickShutdown && clockService.Now().Unix()-startTime.Unix() <= 2*60 {
			fmt.Println("Ignoring off command as service recently started")
			newState = models.On
		}
	}

	// publish the state message if necessary
	if newState != models.On || !additionalStateService.CompareAdditionalState(currentAdditionalState, additionalState) {
		currentAdditionalState = additionalStateService.GetAdditionalState()
		mqttService.PublishDeviceState(hostname, newState, &currentAdditionalState)
	}

	if newState == models.Off {
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

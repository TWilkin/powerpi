package main

import (
	"os"

	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/config-server/services"
	"powerpi/config-server/services/config"
)

var Version = "development"

func main() {
	// setup the services
	container := services.NewConfigServerContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Config Server", Version)

	// use command line args
	configService := services.GetService[config.ConfigService](container)
	configService.Parse(os.Args)

	// connect to MQTT
	mqttService := services.GetService[mqtt.MqttService](container)
	mqttService.Connect("config-server")
}

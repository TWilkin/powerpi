package main

import (
	"os"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/config-server/services"
	"github.com/TWilkin/powerpi/config-server/services/config"
	"github.com/TWilkin/powerpi/config-server/services/manager"
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

	// start the config manager
	manager := services.GetService[manager.ConfigManager](container)
	manager.Start()
}

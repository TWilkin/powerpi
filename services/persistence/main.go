package main

import (
	"os"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/persistence/services"
	"github.com/TWilkin/powerpi/persistence/services/config"
)

var Version = "development"

func main() {
	// setup the services
	container := services.NewPersistenceContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Persistence", Version)

	// use command line args
	configService := services.GetService[config.ConfigService](container)
	configService.Parse(os.Args)

	// connect to MQTT
	mqttService := services.GetService[mqtt.MqttService](container)
	mqttService.Connect("persistence")
}

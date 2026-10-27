package main

import (
	"os"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/persistence/services"
	"github.com/TWilkin/powerpi/persistence/services/config"
	"github.com/TWilkin/powerpi/persistence/services/messagewriter"
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

	// connect to the database
	// dbService := services.GetService[database.DatabaseService](container)
	// dbService.Connect()

	// start the message writer
	writer := services.GetService[messagewriter.MessageWriterService](container)
	writer.Start()
}

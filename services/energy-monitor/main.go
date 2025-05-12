package main

import (
	"os"

	configService "powerpi/common/services/config"
	configRetriever "powerpi/common/services/config_retriever"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/services"
)

var Version = "development"

func main() {
	// setup the services
	container := services.NewEnergyMonitorContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Energy Monitor", Version)

	// use command line args
	configService := services.GetService[configService.ConfigService](container)
	configService.ParseWithFlags(os.Args)

	// connect to MQTT
	mqttService := services.GetService[mqtt.MqttService](container)
	mqttService.Connect("energy-monitor")

	// retrieve the config
	configRetriever := services.GetService[configRetriever.ConfigRetriever](container)
	configRetriever.WaitForConfig()
}

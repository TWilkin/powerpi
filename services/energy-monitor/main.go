package main

import (
	"os"

	configRetriever "powerpi/common/services/config_retriever"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/services"
	"powerpi/energy-monitor/services/config"
	"powerpi/energy-monitor/services/meter"
)

var Version = "development"

func main() {
	// setup the services
	container := services.NewEnergyMonitorContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Energy Monitor", Version)

	// use command line args
	configService := services.GetService[config.ConfigService](container)
	configService.Parse(os.Args)

	// connect to MQTT
	mqttService := services.GetService[mqtt.MqttService](container)
	mqttService.Connect("energy-monitor")

	// retrieve the config
	configRetriever := services.GetService[configRetriever.ConfigRetriever](container)
	configRetriever.WaitForConfig()

	// start the meter manager
	meterManager := services.GetService[meter.MeterManager](container)
	meterManager.Start()
}

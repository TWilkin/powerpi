package main

import (
	"os"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/energy-monitor/services"
	"github.com/TWilkin/powerpi/energy-monitor/services/config"
	"github.com/TWilkin/powerpi/energy-monitor/services/meter"
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

	// start the meter manager
	meterManager := services.GetService[meter.MeterManager](container)
	meterManager.Start()
}

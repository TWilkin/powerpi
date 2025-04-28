package main

import (
	"powerpi/common/services"
	"powerpi/common/services/logger"
)

var Version = "development"

func main() {
	container := services.NewCommonContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Energy Monitor", Version)
}

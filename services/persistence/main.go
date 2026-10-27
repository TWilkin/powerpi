package main

import (
	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/persistence/services"
)

var Version = "development"

func main() {
	// setup the services
	container := services.NewPersistenceContainer()
	logger := services.GetService[logger.LoggerService](container)

	logger.Start("Persistence", Version)
}

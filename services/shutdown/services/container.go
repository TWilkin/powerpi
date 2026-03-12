package services

import (
	"github.com/TWilkin/powerpi/common/services"
	"github.com/TWilkin/powerpi/shutdown/services/additional"
	"github.com/TWilkin/powerpi/shutdown/services/additional/brightness"
	"github.com/TWilkin/powerpi/shutdown/services/config"
)

type ShutdownContainer interface {
	services.CommonContainer
}

type shutdownContainer struct {
	services.CommonContainer
}

func NewShutdownContainer() ShutdownContainer {
	container := &shutdownContainer{
		CommonContainer: services.NewCommonContainer(),
	}

	container.Container().Provide(brightness.NewBrightnessService)
	container.Container().Provide(additional.NewAdditionalStateService)
	container.Container().Provide(config.NewConfigService)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container ShutdownContainer) TService {
	return services.GetService[TService](container)
}

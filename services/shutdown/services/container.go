package services

import (
	"powerpi/common/services"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional/brightness"
	"powerpi/shutdown/services/config"
)

type ShutdownContainer interface {
	services.CommonContainer

	AdditionalStateService() additional.AdditionalStateService
	ShutdownConfigService() config.ConfigService
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

	return container
}

func (container shutdownContainer) AdditionalStateService() additional.AdditionalStateService {
	var additionalStateService *additional.AdditionalStateService

	err := container.Container().Invoke(func(service *additional.AdditionalStateService) {
		additionalStateService = service
	})

	if err != nil {
		panic(err)
	}

	return *additionalStateService
}

func (container shutdownContainer) ShutdownConfigService() config.ConfigService {
	var configService config.ConfigService

	err := container.Container().Invoke(func(service config.ConfigService) {
		configService = service
	})

	if err != nil {
		panic(err)
	}

	return configService
}

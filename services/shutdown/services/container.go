package services

import (
	"go.uber.org/dig"

	"powerpi/common/services"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional/brightness"
)

type ShutdownContainer interface {
	AdditionalStateService() additional.AdditionalStateService
}

type shutdownContainer struct {
	container *dig.Container

	Common services.CommonContainer
}

func NewShutdownContainer() *shutdownContainer {
	container := dig.New()

	container.Provide(brightness.NewBrightnessService)
	container.Provide(additional.NewAdditionalStateService)

	return &shutdownContainer{
		container: container,
		Common:    services.NewCommonContainer(),
	}
}

func (container shutdownContainer) AdditionalStateService() additional.AdditionalStateService {
	var additionalStateService *additional.AdditionalStateService

	err := container.container.Invoke(func(service *additional.AdditionalStateService) {
		additionalStateService = service
	})

	if err != nil {
		panic(err)
	}

	return *additionalStateService
}

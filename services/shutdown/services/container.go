package services

import (
	"powerpi/common/services"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional/brightness"

	"go.uber.org/dig"
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

	container.Provide(brightness.New)
	container.Provide(additional.New)

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

package services

import (
	"powerpi/common/services"
	"powerpi/common/services/config"
)

type EnergyMonitorContainer interface {
	services.CommonContainer
}

type energyMonitorContainer struct {
	services.CommonContainer
}

func NewEnergyMonitorContainer() EnergyMonitorContainer {
	container := &energyMonitorContainer{
		CommonContainer: services.NewCommonContainer(),
	}

	// Override the common config service with the shutdown config service
	container.SetConfigService(config.NewConfigService())

	return container
}

func GetService[TService any](container EnergyMonitorContainer) TService {
	return services.GetService[TService](container)
}

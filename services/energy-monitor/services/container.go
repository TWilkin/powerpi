package services

import (
	"powerpi/common/services"
	"powerpi/energy-monitor/services/config"
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

	container.Container().Provide(config.NewConfigService)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container EnergyMonitorContainer) TService {
	return services.GetService[TService](container)
}

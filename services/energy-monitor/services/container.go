package services

import (
	"powerpi/common/services"
	"powerpi/energy-monitor/services/config"
	energyRetrieverFactory "powerpi/energy-monitor/services/energyretriever/energyretrieverfactory"
	"powerpi/energy-monitor/services/meter"
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
	container.Container().Provide(meter.NewMeterManager)
	container.Container().Provide(energyRetrieverFactory.NewEnergyRetrieverFactory)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container EnergyMonitorContainer) TService {
	return services.GetService[TService](container)
}

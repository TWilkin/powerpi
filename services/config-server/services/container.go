package services

import (
	"powerpi/common/services"
	"powerpi/config-server/services/config"
)

type ConfigServerContainer interface {
	services.CommonContainer
}

type configServerContainer struct {
	services.CommonContainer
}

func NewConfigServerContainer() ConfigServerContainer {
	container := &configServerContainer{
		CommonContainer: services.NewCommonContainer(),
	}

	container.Container().Provide(config.NewConfigService)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container ConfigServerContainer) TService {
	return services.GetService[TService](container)
}

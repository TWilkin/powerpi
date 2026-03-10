package services

import (
	"powerpi/common/services"
	"powerpi/config-server/services/config"
	"powerpi/config-server/services/kubernetes"
	"powerpi/config-server/services/manager"
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
	container.Container().Provide(kubernetes.NewConfigMapService)
	container.Container().Provide(manager.NewConfigManager)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container ConfigServerContainer) TService {
	return services.GetService[TService](container)
}

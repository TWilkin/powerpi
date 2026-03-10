package services

import (
	"embed"

	"powerpi/common/services"
	"powerpi/config-server/schema"
	"powerpi/config-server/services/config"
	"powerpi/config-server/services/converter"
	"powerpi/config-server/services/github"
	"powerpi/config-server/services/kubernetes"
	"powerpi/config-server/services/manager"
	"powerpi/config-server/services/validator"
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
	container.Container().Provide(converter.NewConverterService)
	container.Container().Provide(github.NewGitHubService)
	container.Container().Provide(kubernetes.NewConfigMapService)
	container.Container().Provide(manager.NewConfigManager)
	container.Container().Provide(validator.NewValidatorService)

	// Override the common config service with the shutdown config service
	container.SetConfigService(GetService[config.ConfigService](container))

	// Include the schema
	container.Container().Provide(func() embed.FS {
		return schema.Schema
	})

	return container
}

func GetService[TService any](container ConfigServerContainer) TService {
	return services.GetService[TService](container)
}

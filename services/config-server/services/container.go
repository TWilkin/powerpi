package services

import (
	"embed"

	"github.com/TWilkin/powerpi/common/services"
	"github.com/TWilkin/powerpi/config-server/schema"
	"github.com/TWilkin/powerpi/config-server/services/config"
	"github.com/TWilkin/powerpi/config-server/services/converter"
	"github.com/TWilkin/powerpi/config-server/services/device"
	"github.com/TWilkin/powerpi/config-server/services/github"
	"github.com/TWilkin/powerpi/config-server/services/kubernetes"
	"github.com/TWilkin/powerpi/config-server/services/manager"
	"github.com/TWilkin/powerpi/config-server/services/validator"
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
	container.Container().Provide(device.NewDeviceConfigHandler)
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

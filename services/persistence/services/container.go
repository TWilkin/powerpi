package services

import (
	"github.com/TWilkin/powerpi/common/services"
	"github.com/TWilkin/powerpi/persistence/services/config"
)

type PersistenceContainer interface {
	services.CommonContainer
}

type persistenceContainer struct {
	services.CommonContainer
}

func NewPersistenceContainer() PersistenceContainer {
	container := &persistenceContainer{
		CommonContainer: services.NewCommonContainer(),
	}

	container.Container().Provide(config.NewConfigService)

	// Override the common config service with the persistence config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container PersistenceContainer) TService {
	return services.GetService[TService](container)
}

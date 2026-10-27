package services

import (
	"github.com/TWilkin/powerpi/common/services"
	"github.com/TWilkin/powerpi/persistence/services/config"
	"github.com/TWilkin/powerpi/persistence/services/database"
	"github.com/TWilkin/powerpi/persistence/services/messagewriter"
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
	container.Container().Provide(database.NewDatabaseService)
	container.Container().Provide(messagewriter.NewMessageWriterService)

	// Override the common config service with the persistence config service
	container.SetConfigService(GetService[config.ConfigService](container))

	return container
}

func GetService[TService any](container PersistenceContainer) TService {
	return services.GetService[TService](container)
}

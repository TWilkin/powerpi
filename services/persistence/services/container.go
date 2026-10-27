package services

import "github.com/TWilkin/powerpi/common/services"

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

	return container
}

func GetService[TService any](container PersistenceContainer) TService {
	return services.GetService[TService](container)
}

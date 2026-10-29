package health

import (
	commonHealth "github.com/TWilkin/powerpi/common/services/health"
	"github.com/TWilkin/powerpi/common/services/logger"
)

type PersistenceHealthService interface {
	commonHealth.HealthService
}

type persistenceHealthService struct {
	commonHealth.HealthService
}

func NewHealthService(logger logger.LoggerService) PersistenceHealthService {
	return persistenceHealthService{
		HealthService: commonHealth.NewHealthService(logger),
	}
}

func (health persistenceHealthService) Start() {
	health.HealthService.Start()
}

func (health persistenceHealthService) Check() bool {
	return true
}

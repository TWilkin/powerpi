package health

import (
	commonHealth "github.com/TWilkin/powerpi/common/services/health"
	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/common/services/mqtt"
	"github.com/TWilkin/powerpi/persistence/services/database"
)

type PersistenceHealthService interface {
	commonHealth.HealthService
}

type persistenceHealthService struct {
	commonHealth.HealthService
	mqtt     mqtt.MqttService
	database database.DatabaseService
}

func NewHealthService(
	logger logger.LoggerService,
	mqtt mqtt.MqttService,
	database database.DatabaseService,
) PersistenceHealthService {
	return persistenceHealthService{
		HealthService: commonHealth.NewHealthService(logger),
		mqtt:          mqtt,
		database:      database,
	}
}

func (health persistenceHealthService) Start() {
	health.HealthService.StartWithCheck(func() bool {
		return health.check()
	})
}

func (health persistenceHealthService) check() bool {
	if !health.mqtt.IsConnected() {
		return false
	}

	if !health.database.IsConnected() {
		return false
	}

	return true
}

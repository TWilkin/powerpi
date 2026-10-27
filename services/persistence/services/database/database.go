package database

import (
	"database/sql"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/persistence/services/config"
	"github.com/lib/pq"
	_ "github.com/lib/pq"
)

type DatabaseService interface {
	Connect()
}

type databaseService struct {
	config config.ConfigService
	logger logger.LoggerService

	connection *sql.DB
}

func NewDatabaseService(config config.ConfigService, logger logger.LoggerService) DatabaseService {
	return &databaseService{
		config: config,
		logger: logger,
	}
}

func (service *databaseService) Connect() {
	config := pq.Config{
		Host: service.config.GetPersistenceConfig().Host,
		Port: uint16(service.config.GetPersistenceConfig().Port),
		User: service.config.GetPersistenceConfig().User,
	}

	service.logger.Info("Connecting to database", "host", config.Host, "user", config.User)

	connector, err := pq.NewConnectorConfig(config)
	if err != nil {
		service.logger.Error("Failed to connect to database", "error", err)
		return
	}

	db := sql.OpenDB(connector)
	defer db.Close()
	service.connection = db

	// test the connection
	err = db.Ping()
	if err != nil {
		service.logger.Error("Unable to ping database", "error", err)
		return
	}
}

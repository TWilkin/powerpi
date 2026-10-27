package config

import (
	commonConfigService "github.com/TWilkin/powerpi/common/services/config"
	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/persistence/config"
	"github.com/spf13/pflag"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)

	GetPersistenceConfig() config.PersistenceConfig
}

type configService struct {
	commonConfigService.ConfigService
	logger logger.LoggerService

	persistence config.PersistenceConfig
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(
			logger,
			commonConfigService.WithRequiredConfigFile(),
		),

		logger: logger,

		persistence: config.PersistenceConfig{},
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("persistence", pflag.ExitOnError)

	flagSet.StringVar(&service.persistence.Host, "databaseHost", "db", "The host for the database")
	flagSet.Uint16Var(&service.persistence.Port, "databasePort", 5432, "The port for the database")
	flagSet.StringVar(&service.persistence.User, "databaseUser", "powerpi", "The username for the database")
	flagSet.StringVar(&service.persistence.PasswordFile, "databasePassword", "undefined", "The file containing the password for the database")

	service.ConfigService.ParseWithFlags(args, *flagSet)

	service.EnvironmentOverride(flagSet, "databaseHost", "DB_HOST")
	service.EnvironmentOverride(flagSet, "databasePort", "DB_PORT")
	service.EnvironmentOverride(flagSet, "databaseUser", "DB_USER")
	service.EnvironmentOverride(flagSet, "databasePassword", "DB_SECRET_FILE")
}

func (service *configService) GetPersistenceConfig() config.PersistenceConfig {
	return service.persistence
}

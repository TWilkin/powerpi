package config

import (
	"github.com/spf13/pflag"

	commonConfigService "powerpi/common/services/config"
	"powerpi/common/services/logger"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)
}

type configService struct {
	commonConfigService.ConfigService
	logger logger.LoggerService
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
		logger:        logger,
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("config-service", pflag.ExitOnError)

	service.ConfigService.ParseWithFlags(args, *flagSet)
}

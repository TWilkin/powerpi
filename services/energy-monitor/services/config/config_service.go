package config

import (
	"powerpi/common/models"
	commonConfigService "powerpi/common/services/config"
	"powerpi/common/services/logger"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)
}

type configService struct {
	commonConfigService.ConfigService
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
	}
}

func (service *configService) Parse(args []string) {
	service.ConfigService.ParseWithFlags(args)
}

func (service *configService) RequiredConfig() []models.ConfigType {
	return []models.ConfigType{
		models.ConfigTypeDevices,
	}
}

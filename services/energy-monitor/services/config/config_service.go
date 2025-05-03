package config

import (
	"powerpi/common/models"
	commonConfigService "powerpi/common/services/config"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)
}

type configService struct {
	commonConfigService.ConfigService
}

func NewConfigService() ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(),
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

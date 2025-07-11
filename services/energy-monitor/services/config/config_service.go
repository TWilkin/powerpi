package config

import (
	"github.com/spf13/pflag"

	"powerpi/common/models"
	commonConfigService "powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/energy-monitor/config"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)

	GetOctopusAPIKey() *string
}

type configService struct {
	commonConfigService.ConfigService
	logger logger.LoggerService

	octopus config.OctopusConfig
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
		logger:        logger,
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("energy-monitor", pflag.ExitOnError)

	// Octopus specific flags
	flagSet.StringVar(&service.octopus.ApiKeyFile, "octopusApiKey", "undefined", "The path to the Octopus API key file")

	service.ConfigService.ParseWithFlags(args, *flagSet)

	service.logger.Info("here")
	service.EnvironmentOverride(flagSet, "octopusApiKey", "OCTOPUS_API_KEY_FILE")
}

func (service *configService) RequiredConfig() []models.ConfigType {
	return []models.ConfigType{
		models.ConfigTypeDevices,
	}
}

func (service *configService) GetOctopusAPIKey() *string {
	password, err := service.ReadPasswordFile(service.octopus.ApiKeyFile)
	if err != nil {
		service.logger.Error("Failed to read Octopus API key file", "error", err)
		panic(err)
	}

	return password
}

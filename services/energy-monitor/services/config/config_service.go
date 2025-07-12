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

	GetEnergyMonitorConfig() config.EnergyMonitorConfig
	GetOctopusAPIKey() *string
}

type configService struct {
	commonConfigService.ConfigService
	logger logger.LoggerService

	energyMonitor config.EnergyMonitorConfig
	octopus       config.OctopusConfig
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
		logger:        logger,

		energyMonitor: config.EnergyMonitorConfig{},
		octopus:       config.OctopusConfig{},
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("energy-monitor", pflag.ExitOnError)

	flagSet.Int32Var(
		&service.energyMonitor.MessageWriteDelay,
		"messageWriteDelay",
		100,
		"The number of milliseconds to wait between publishing each message, to ensure we don't overwhelm the message queue.",
	)

	// Octopus specific flags
	flagSet.StringVar(&service.octopus.ApiKeyFile, "octopusApiKey", "undefined", "The path to the Octopus API key file")

	service.ConfigService.ParseWithFlags(args, *flagSet)

	service.EnvironmentOverride(flagSet, "messageWriteDelay", "MESSAGE_WRITE_DELAY")

	service.EnvironmentOverride(flagSet, "octopusApiKey", "OCTOPUS_API_KEY_FILE")
}

func (service *configService) RequiredConfig() []models.ConfigType {
	return []models.ConfigType{
		models.ConfigTypeDevices,
	}
}

func (service *configService) GetEnergyMonitorConfig() config.EnergyMonitorConfig {
	return service.energyMonitor
}

func (service *configService) GetOctopusAPIKey() *string {
	password, err := service.ReadPasswordFile(service.octopus.ApiKeyFile)
	if err != nil {
		service.logger.Error("Failed to read Octopus API key file", "error", err)
		panic(err)
	}

	return password
}

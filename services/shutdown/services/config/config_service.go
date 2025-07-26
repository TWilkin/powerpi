package config

import (
	"github.com/spf13/pflag"

	commonConfig "powerpi/common/config"
	commonConfigService "powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/shutdown/config"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)

	Config() config.Config
}

type configService struct {
	commonConfigService.ConfigService

	config config.Config
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("shutdown", pflag.ExitOnError)

	// additional state
	// brightness
	flagSet.StringVar(
		&service.config.AdditionalState.Brightness.Device,
		"brightnessDevice",
		"",
		"The path to the device to use for controller brightness, e.g. \"/sys/class/backlight/10-0045/brightness\" for a Pi Touch Display 2",
	)
	flagSet.Float64Var(
		&service.config.AdditionalState.Brightness.Min,
		"brightnessMin",
		0.0,
		"The minimum value supported for the brightness setting, e.g. 0 for a Pi Touch Display 2",
	)
	flagSet.Float64Var(
		&service.config.AdditionalState.Brightness.Max,
		"brightnessMax",
		100.0,
		"The maximum value supported for the brightness setting, e.g. 31 for a Pi Touch Display 2",
	)

	// others
	flagSet.BoolVar(
		&service.config.AllowQuickShutdown,
		"allowQuickShutdown",
		false,
		"If true allow a message within 2 minutes of service starting to initiate a shutdown",
	)
	flagSet.BoolVar(&service.config.Mock, "mock", false, "Whether to actually shutdown or not")

	service.ConfigService.ParseWithFlags(args, *flagSet)
}

func (service configService) Config() config.Config {
	return service.config
}

func (service configService) MqttConfig() commonConfig.MqttConfig {
	return service.ConfigService.MqttConfig()
}

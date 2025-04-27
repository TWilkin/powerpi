package config

import (
	"github.com/spf13/pflag"

	"powerpi/common/services/config"
)

type AdditionalStateConfig struct {
	Brightness BrightnessConfig
}

type BrightnessConfig struct {
	Device string
	Min    float64
	Max    float64
}

type configService interface {
	Parse(args []string)
}

type ConfigService struct {
	config.ConfigService

	AdditionalState AdditionalStateConfig

	AllowQuickShutdown bool
	Mock               bool
}

func NewConfigService() *ConfigService {
	return &ConfigService{
		ConfigService: config.NewConfigService(),
	}
}

func (service *ConfigService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("shutdown", pflag.ExitOnError)

	// additional state
	// brightness
	flagSet.StringVar(
		&service.AdditionalState.Brightness.Device,
		"brightnessDevice",
		"",
		"The path to the device to use for controller brightness, e.g. \"/sys/class/backlight/10-0045/brightness\" for a Pi Touch Display 2",
	)
	flagSet.Float64Var(
		&service.AdditionalState.Brightness.Min,
		"brightnessMin",
		0.0,
		"The minimum value supported for the brightness setting, e.g. 0 for a Pi Touch Display 2",
	)
	flagSet.Float64Var(
		&service.AdditionalState.Brightness.Max,
		"brightnessMax",
		100.0,
		"The maximum value supported for the brightness setting, e.g. 31 for a Pi Touch Display 2",
	)

	// others
	flagSet.BoolVar(
		&service.AllowQuickShutdown,
		"allowQuickShutdown",
		false,
		"If true allow a message within 2 minutes of service starting to initiate a shutdown",
	)
	flagSet.BoolVar(&service.Mock, "mock", false, "Whether to actually shutdown or not")

	service.ConfigService.Parse(args, *flagSet)
}

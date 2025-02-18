package services

import (
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/flags"
)

type Container struct {
	Config     flags.Config
	Additional additional.AdditionalContainer
}

func SetupServices(config flags.Config) Container {
	return Container{
		config,
		additional.SetupServices(config.AdditionalState),
	}
}

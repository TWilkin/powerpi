package main

import (
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional/brightness"
	"powerpi/shutdown/services/flags"
)

type Container struct {
	Config                 flags.Config
	AdditionalStateService additional.IAdditionalStateService
	BrightnessService      brightness.IBrightnessService
}

func SetupServices(config flags.Config) Container {
	brightness := brightness.New(config.AdditionalState.Brightness)

	return Container{
		config,
		additional.New(config.AdditionalState, brightness),
		brightness,
	}
}

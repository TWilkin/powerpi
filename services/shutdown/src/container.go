package main

import (
	"os"

	"powerpi/shutdown/additional"
	"powerpi/shutdown/additional/brightness"
	"powerpi/shutdown/flags"
)

type Container struct {
	Config                 flags.Config
	AdditionalStateService additional.IAdditionalStateService
	BrightnessService      brightness.IBrightnessService
}

func SetupServices(config flags.Config) Container {
	brightness := brightness.New(config.AdditionalState.Brightness, os.DirFS("/"))

	return Container{
		config,
		additional.New(config.AdditionalState, brightness),
		brightness,
	}
}

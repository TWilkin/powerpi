package additional

import (
	"powerpi/shutdown/services/additional/brightness"
	"powerpi/shutdown/services/flags"
)

type AdditionalContainer struct {
	AdditionalStateService AdditionalStateService
	BrightnessService      brightness.BrightnessService
}

func SetupServices(config flags.AdditionalStateConfig) AdditionalContainer {
	brightness := brightness.New(config.Brightness)

	return AdditionalContainer{
		New(config, brightness),
		brightness,
	}
}

package additional

import (
	"os"

	"powerpi/shutdown/additional/brightness"
	"powerpi/shutdown/flags"
)

type AdditionalState struct {
	Brightness *int
}

func GetAdditionalState(config flags.AdditionalStateConfig) AdditionalState {
	var additionalState AdditionalState

	if len(config.Brightness.Device) > 0 {
		var brightnessValue *int = new(int)
		*brightnessValue = brightness.GetBrightness(os.DirFS("/"), config.Brightness)

		if *brightnessValue >= 0 {
			additionalState.Brightness = brightnessValue
		}
	}

	return additionalState
}

func SetAdditionalState(config flags.AdditionalStateConfig, state AdditionalState) {
	if len(config.Brightness.Device) > 0 && state.Brightness != nil && *state.Brightness >= 0 {
		brightness.SetBrightness(config.Brightness, *state.Brightness)
	}
}

func CompareAdditionalState(state1 AdditionalState, state2 AdditionalState) bool {
	return state1.Brightness == state2.Brightness
}

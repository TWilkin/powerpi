package additional

import (
	"powerpi/shutdown/additional/brightness"
)

type AdditionalStateDevice struct {
	Brightness *string
}

type AdditionalState struct {
	Brightness *int
}

func GetAdditionalState(device AdditionalStateDevice) AdditionalState {
	var additionalState AdditionalState

	if device.Brightness != nil {
		var brightnessValue *int = new(int)
		*brightnessValue = brightness.GetBrightness(*device.Brightness)

		if *brightnessValue >= 0 {
			additionalState.Brightness = brightnessValue
		}
	}

	return additionalState
}

func SetAdditionalState(device AdditionalStateDevice, state AdditionalState) {
	if device.Brightness != nil && state.Brightness != nil && *state.Brightness >= 0 {
		brightness.SetBrightness(*device.Brightness, *state.Brightness)
	}
}

func CompareAdditionalState(state1 AdditionalState, state2 AdditionalState) bool {
	return state1.Brightness == state2.Brightness
}

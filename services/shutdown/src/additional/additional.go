package additional

import (
	"powerpi/shutdown/additional/brightness"
)

type AdditionalState struct {
	Brightness *int
}

func GetAdditionalState(brightnessDevice *brightness.BrightnessDevice) AdditionalState {
	var additionalState AdditionalState

	if brightnessDevice != nil {
		var brightnessValue *int = new(int)
		*brightnessValue = brightness.GetBrightness(*brightnessDevice)
		additionalState.Brightness = brightnessValue
	}

	return additionalState
}

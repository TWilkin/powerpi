package additional

import (
	"powerpi/shutdown/services/additional/brightness"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/utils"
)

type AdditionalState struct {
	Brightness *int
}

type IAdditionalStateService interface {
	GetAdditionalState() AdditionalState

	SetAdditionalState(state AdditionalState)

	CompareAdditionalState(state1 AdditionalState, state2 AdditionalState) bool
}

type AdditionalStateService struct {
	config     flags.AdditionalStateConfig
	brightness brightness.IBrightnessService
}

func New(config flags.AdditionalStateConfig, brightness brightness.IBrightnessService) AdditionalStateService {
	return AdditionalStateService{config, brightness}
}

func (service AdditionalStateService) GetAdditionalState() AdditionalState {
	var additionalState AdditionalState

	if len(service.config.Brightness.Device) > 0 {
		var brightnessValue *int = new(int)
		*brightnessValue = service.brightness.GetBrightness()

		if *brightnessValue >= 0 {
			additionalState.Brightness = brightnessValue
		}
	}

	return additionalState
}

func (service AdditionalStateService) SetAdditionalState(state AdditionalState) {
	if len(service.config.Brightness.Device) > 0 && state.Brightness != nil && *state.Brightness >= 0 {
		service.brightness.SetBrightness(*state.Brightness)
	}
}

func (service AdditionalStateService) CompareAdditionalState(state1 AdditionalState, state2 AdditionalState) bool {
	return utils.NilOrEqual(state1.Brightness, state2.Brightness)
}

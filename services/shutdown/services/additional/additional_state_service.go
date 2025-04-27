package additional

import (
	"powerpi/common/models"
	"powerpi/common/utils"

	"powerpi/shutdown/config"
	"powerpi/shutdown/services/additional/brightness"
	configService "powerpi/shutdown/services/config"
)

type AdditionalStateService interface {
	GetAdditionalState() models.AdditionalState

	SetAdditionalState(state models.AdditionalState)

	CompareAdditionalState(state1 models.AdditionalState, state2 models.AdditionalState) bool
}

type additionalStateService struct {
	config     config.AdditionalStateConfig
	brightness brightness.BrightnessService
}

func NewAdditionalStateService(
	configService configService.ConfigService,
	brightness brightness.BrightnessService,
) AdditionalStateService {
	return additionalStateService{configService.Config().AdditionalState, brightness}
}

func (service additionalStateService) GetAdditionalState() models.AdditionalState {
	var additionalState models.AdditionalState

	if len(service.config.Brightness.Device) > 0 {
		var brightnessValue *int = new(int)
		*brightnessValue = service.brightness.GetBrightness()

		if *brightnessValue >= 0 {
			additionalState.Brightness = brightnessValue
		}
	}

	return additionalState
}

func (service additionalStateService) SetAdditionalState(state models.AdditionalState) {
	if len(service.config.Brightness.Device) > 0 && state.Brightness != nil && *state.Brightness >= 0 {
		service.brightness.SetBrightness(*state.Brightness)
	}
}

func (service additionalStateService) CompareAdditionalState(
	state1 models.AdditionalState,
	state2 models.AdditionalState,
) bool {
	return utils.NilOrEqual(state1.Brightness, state2.Brightness)
}

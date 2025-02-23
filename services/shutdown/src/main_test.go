package main

import (
	"testing"
	"time"

	"powerpi/shutdown/models"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/additional_test"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/services/mqtt_test"
	"powerpi/shutdown/utils"

	"github.com/stretchr/testify/mock"
)

func TestUpdateState(t *testing.T) {
	var tests = []struct {
		name                    string
		state                   models.DeviceState
		additionalState         additional.AdditionalState
		compare                 bool
		expectedCompare         bool
		expectedState           *models.DeviceState
		expectedAdditionalState *additional.AdditionalState
	}{
		{
			"publishes state",
			models.Off,
			additional.AdditionalState{Brightness: utils.ToPtr(50)},
			true,
			false,
			utils.ToPtr(models.Off),
			&additional.AdditionalState{Brightness: utils.ToPtr(50)},
		},
		{
			"publishes additional state",
			models.On,
			additional.AdditionalState{Brightness: utils.ToPtr(40)},
			false,
			true,
			utils.ToPtr(models.On),
			&additional.AdditionalState{Brightness: utils.ToPtr(40)},
		},
		{
			"does not publish",
			models.On,
			additional.AdditionalState{Brightness: utils.ToPtr(50)},
			true,
			true,
			nil,
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			additionalStateService := &additional_test.MockAdditionalStateService{}
			client := &mqtt_test.MockMqttClient{}
			config := flags.Config{Mock: true}
			startTime := time.Now()

			additionalStateService.On("GetAdditionalState").Return(
				additional.AdditionalState{Brightness: utils.ToPtr(50)},
			).Once()
			additionalStateService.On("SetAdditionalState", test.additionalState).Return()

			if test.expectedCompare {
				additionalStateService.On(
					"CompareAdditionalState",
					mock.AnythingOfType("additional.AdditionalState"),
					mock.AnythingOfType("additional.AdditionalState"),
				).Return(test.compare)
			}

			if test.expectedState != nil {
				additionalStateService.On("GetAdditionalState").Return(
					test.additionalState,
				).Once()

				client.On(
					"PublishState",
					*test.expectedState,
					mock.MatchedBy(func(state additional.AdditionalState) bool {
						return utils.NilOrEqual(
							state.Brightness,
							test.expectedAdditionalState.Brightness,
						)
					}),
				).Return()
			}

			updateState(
				additionalStateService,
				client,
				config,
				test.state,
				test.additionalState,
				startTime,
			)

			additionalStateService.AssertExpectations(t)
			client.AssertExpectations(t)
		})
	}
}

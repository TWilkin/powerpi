package main

import (
	"testing"
	"time"

	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
	"powerpi/common/services/mqtt"
	"powerpi/common/utils"
	"powerpi/shutdown/config"
	"powerpi/shutdown/services/additional"
)

func TestUpdateState(t *testing.T) {
	var tests = []struct {
		name                    string
		state                   models.DeviceState
		additionalState         models.AdditionalState
		compare                 bool
		expectedCompare         bool
		expectedState           *models.DeviceState
		expectedAdditionalState *models.AdditionalState
	}{
		{
			"publishes state",
			models.Off,
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			true,
			false,
			utils.ToPtr(models.Off),
			&models.AdditionalState{Brightness: utils.ToPtr(50)},
		},
		{
			"publishes additional state",
			models.On,
			models.AdditionalState{Brightness: utils.ToPtr(40)},
			false,
			true,
			utils.ToPtr(models.On),
			&models.AdditionalState{Brightness: utils.ToPtr(40)},
		},
		{
			"does not publish",
			models.On,
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			true,
			true,
			nil,
			nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			additionalStateService := &additional.MockAdditionalStateService{}
			mqttService := &mqtt.MockMqttService{}
			config := config.Config{Mock: true}
			startTime := time.Now()
			hostname := "test-hostname"

			additionalStateService.On("GetAdditionalState").Return(
				models.AdditionalState{Brightness: utils.ToPtr(50)},
			).Once()
			additionalStateService.On("SetAdditionalState", test.additionalState).Return()

			if test.expectedCompare {
				additionalStateService.On(
					"CompareAdditionalState",
					mock.AnythingOfType("models.AdditionalState"),
					mock.AnythingOfType("models.AdditionalState"),
				).Return(test.compare)
			}

			if test.expectedState != nil {
				additionalStateService.On("GetAdditionalState").Return(
					test.additionalState,
				).Once()

				mqttService.On(
					"PublishDeviceState",
					hostname,
					*test.expectedState,
					mock.MatchedBy(func(state *models.AdditionalState) bool {
						return utils.NilOrEqual(
							state.Brightness,
							test.expectedAdditionalState.Brightness,
						)
					}),
				).Return()
			}

			updateState(
				additionalStateService,
				mqttService,
				config,
				hostname,
				test.state,
				test.additionalState,
				startTime,
			)

			additionalStateService.AssertExpectations(t)
			mqttService.AssertExpectations(t)
		})
	}
}

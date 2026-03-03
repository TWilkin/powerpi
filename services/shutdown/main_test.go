package main

import (
	"testing"
	"time"

	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
	"powerpi/common/services/clock"
	"powerpi/common/services/mqtt/messagequeue"
	"powerpi/common/utils"
	"powerpi/shutdown/config"
	"powerpi/shutdown/services/additional"
)

func TestUpdateState(t *testing.T) {
	var tests = []struct {
		name                    string
		state                   models.DeviceState
		additionalState         models.AdditionalState
		startTimeOffset         time.Duration
		compare                 bool
		expectedCompare         bool
		expectedState           *models.DeviceState
		expectedAdditionalState *models.AdditionalState
	}{
		{
			"publishes state",
			models.Off,
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			-5 * time.Minute,
			true,
			false,
			utils.ToPtr(models.Off),
			&models.AdditionalState{Brightness: utils.ToPtr(50)},
		},
		{
			"publishes additional state",
			models.On,
			models.AdditionalState{Brightness: utils.ToPtr(40)},
			-5 * time.Minute,
			false,
			true,
			utils.ToPtr(models.On),
			&models.AdditionalState{Brightness: utils.ToPtr(40)},
		},
		{
			"does not publish",
			models.On,
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			-5 * time.Minute,
			true,
			true,
			nil,
			nil,
		},
		{
			"does not publish, quick start",
			models.Off,
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			-1 * time.Minute,
			true,
			true,
			nil,
			nil,
		},
		{
			"publishes additional state, quick start",
			models.Off,
			models.AdditionalState{Brightness: utils.ToPtr(40)},
			-1 * time.Minute,
			false,
			true,
			utils.ToPtr(models.On),
			&models.AdditionalState{Brightness: utils.ToPtr(40)},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			additionalStateService := &additional.MockAdditionalStateService{}
			deviceService := &messagequeue.MockDeviceMessageService{}
			clockService := &clock.MockClockService{}
			config := config.Config{Mock: true, AllowQuickShutdown: false}
			startTime := clockService.Now().Add(test.startTimeOffset)
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

				deviceService.On(
					"PublishState",
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
				deviceService,
				clockService,
				config,
				hostname,
				test.state,
				test.additionalState,
				startTime,
			)

			additionalStateService.AssertExpectations(t)
			deviceService.AssertExpectations(t)
		})
	}
}

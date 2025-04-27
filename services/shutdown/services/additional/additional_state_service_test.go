package additional

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"powerpi/common/models"
	"powerpi/common/utils"
	"powerpi/shutdown/config"
	"powerpi/shutdown/services/additional/brightness"
)

func TestGetAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		config   config.AdditionalStateConfig
		expected models.AdditionalState
	}{
		{"empty config", config.AdditionalStateConfig{}, models.AdditionalState{}},
		{
			"brightness config",
			config.AdditionalStateConfig{Brightness: config.BrightnessConfig{Device: "test"}},
			models.AdditionalState{Brightness: utils.ToPtr(50)},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			subject := NewAdditionalStateService(test.config, &brightness.MockBrightnessService{Brightness: 50})

			result := subject.GetAdditionalState()

			assert.Equal(t, result, test.expected)
		})
	}
}

func TestSetAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		config   config.AdditionalStateConfig
		expected int
	}{
		{"empty config", config.AdditionalStateConfig{}, 0},
		{
			"brightness config",
			config.AdditionalStateConfig{Brightness: config.BrightnessConfig{Device: "test"}}, 50,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockBrightness := brightness.MockBrightnessService{Brightness: 0}
			subject := NewAdditionalStateService(test.config, &mockBrightness)

			subject.SetAdditionalState(models.AdditionalState{Brightness: utils.ToPtr(50)})

			assert.Equal(t, mockBrightness.Brightness, test.expected)
		})
	}
}

func TestCompareAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		state1   models.AdditionalState
		state2   models.AdditionalState
		expected bool
	}{
		{
			"brightness match",
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			true,
		},
		{
			"brightness nil match",
			models.AdditionalState{Brightness: nil},
			models.AdditionalState{Brightness: nil},
			true,
		},
		{
			"brightness mismatch",
			models.AdditionalState{Brightness: utils.ToPtr(51)},
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			false,
		},
		{
			"brightness nil mismatch",
			models.AdditionalState{Brightness: nil},
			models.AdditionalState{Brightness: utils.ToPtr(50)},
			false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := additionalStateService{}.CompareAdditionalState(test.state1, test.state2)

			assert.Equal(t, result, test.expected)
		})
	}
}

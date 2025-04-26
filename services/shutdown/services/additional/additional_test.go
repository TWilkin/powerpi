package additional

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"powerpi/common/models"
	"powerpi/common/utils"
	"powerpi/shutdown/services/flags"
)

type MockBrightnessService struct {
	brightness int
}

func (service MockBrightnessService) GetBrightness() int {
	return 50
}

func (service *MockBrightnessService) SetBrightness(value int) {
	service.brightness = value
}

func TestGetAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		config   flags.AdditionalStateConfig
		expected models.AdditionalState
	}{
		{"empty config", flags.AdditionalStateConfig{}, models.AdditionalState{}},
		{
			"brightness config",
			flags.AdditionalStateConfig{Brightness: flags.BrightnessConfig{Device: "test"}},
			models.AdditionalState{Brightness: utils.ToPtr(50)},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			subject := New(test.config, &MockBrightnessService{50})

			result := subject.GetAdditionalState()

			assert.Equal(t, result, test.expected)
		})
	}
}

func TestSetAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		config   flags.AdditionalStateConfig
		expected int
	}{
		{"empty config", flags.AdditionalStateConfig{}, 0},
		{
			"brightness config",
			flags.AdditionalStateConfig{Brightness: flags.BrightnessConfig{Device: "test"}}, 50,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockBrightness := MockBrightnessService{0}
			subject := New(test.config, &mockBrightness)

			subject.SetAdditionalState(models.AdditionalState{Brightness: utils.ToPtr(50)})

			assert.Equal(t, mockBrightness.brightness, test.expected)
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

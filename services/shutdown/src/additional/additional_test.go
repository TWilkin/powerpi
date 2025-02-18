package additional

import (
	"testing"

	"powerpi/shutdown/flags"
)

func intPtr(value int) *int {
	return &value
}

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
		expected AdditionalState
	}{
		{"empty config", flags.AdditionalStateConfig{}, AdditionalState{}},
		{"brightness config", flags.AdditionalStateConfig{Brightness: flags.BrightnessConfig{Device: "test"}}, AdditionalState{Brightness: intPtr(50)}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			subject := New(test.config, &MockBrightnessService{50})

			result := subject.GetAdditionalState()

			if subject.CompareAdditionalState(result, test.expected) == false {
				t.Errorf("GetAdditionalState incorrect, got: %v, expected: %v", result, test.expected)
			}
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
		{"brightness config", flags.AdditionalStateConfig{Brightness: flags.BrightnessConfig{Device: "test"}}, 50},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockBrightness := MockBrightnessService{0}
			subject := New(test.config, &mockBrightness)

			subject.SetAdditionalState(AdditionalState{Brightness: intPtr(50)})

			if mockBrightness.brightness != test.expected {
				t.Errorf("SetAdditionalState incorrect, got: %v, expected: %v", mockBrightness.brightness, test.expected)
			}
		})
	}
}

func TestCompareAdditionalState(t *testing.T) {
	var tests = []struct {
		name     string
		state1   AdditionalState
		state2   AdditionalState
		expected bool
	}{
		{"brightness match", AdditionalState{Brightness: intPtr(50)}, AdditionalState{Brightness: intPtr(50)}, true},
		{"brightness nil match", AdditionalState{Brightness: nil}, AdditionalState{Brightness: nil}, true},
		{"brightness mismatch", AdditionalState{Brightness: intPtr(51)}, AdditionalState{Brightness: intPtr(50)}, false},
		{"brightness nil mismatch", AdditionalState{Brightness: nil}, AdditionalState{Brightness: intPtr(50)}, false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := AdditionalStateService{}.CompareAdditionalState(test.state1, test.state2)

			if result != test.expected {
				t.Errorf("CompareAdditionalState incorrect, got: %t, expected: %t", result, test.expected)
			}
		})
	}
}

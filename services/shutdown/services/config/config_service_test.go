package config

import (
	"testing"

	"powerpi/common/services/logger"
	"powerpi/shutdown/config"
)

func TestParse(t *testing.T) {
	var tests = []struct {
		name     string
		args     []string
		expected config.Config
	}{
		{
			"default values",
			[]string{"my service"},
			config.Config{
				AdditionalState: config.AdditionalStateConfig{
					Brightness: config.BrightnessConfig{
						Device: "",
						Min:    0.0,
						Max:    100.0,
					},
				},
				AllowQuickShutdown: false,
				Mock:               false,
			},
		},
		{
			"overridden values",
			[]string{
				"my service",
				"--brightnessDevice", "/path/to/device",
				"--brightnessMin", "10",
				"--brightnessMax", "20",
				"--allowQuickShutdown", "true",
				"--mock", "true",
			},
			config.Config{
				AdditionalState: config.AdditionalStateConfig{
					Brightness: config.BrightnessConfig{
						Device: "/path/to/device",
						Min:    10.0,
						Max:    20.0,
					},
				},
				AllowQuickShutdown: true,
				Mock:               true,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {

			service := NewConfigService(logger.SetupMockLoggerService())

			service.Parse(test.args)

			config := service.Config()

			if config.AdditionalState.Brightness.Device != test.expected.AdditionalState.Brightness.Device {
				t.Errorf("Expected brightnessDevice to be '%s', got '%s'", test.expected.AdditionalState.Brightness.Device, config.AdditionalState.Brightness.Device)
			}
			if config.AdditionalState.Brightness.Min != test.expected.AdditionalState.Brightness.Min {
				t.Errorf("Expected brightnessMin to be %f, got %f", test.expected.AdditionalState.Brightness.Min, config.AdditionalState.Brightness.Min)
			}
			if config.AdditionalState.Brightness.Max != test.expected.AdditionalState.Brightness.Max {
				t.Errorf("Expected brightnessMax to be %f, got %f", test.expected.AdditionalState.Brightness.Max, config.AdditionalState.Brightness.Max)
			}
			if config.AllowQuickShutdown != test.expected.AllowQuickShutdown {
				t.Errorf("Expected allowQuickShutdown to be %t, got %t", test.expected.AllowQuickShutdown, config.AllowQuickShutdown)
			}
			if config.Mock != test.expected.Mock {
				t.Errorf("Expected mock to be %t, got %t", test.expected.Mock, config.Mock)
			}
		})
	}
}

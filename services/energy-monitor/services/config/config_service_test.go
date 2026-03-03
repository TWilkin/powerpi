package config

import (
	"testing"

	"powerpi/common/services/logger"
	"powerpi/energy-monitor/config"
)

func TestParse(t *testing.T) {
	var tests = []struct {
		name     string
		args     []string
		expected config.EnergyMonitorConfig
	}{
		{
			"default values",
			[]string{"energy-monitor"},
			config.EnergyMonitorConfig{
				MessageWriteDelay: 100,
				History:           30,
			},
		},
		{
			"overridden values",
			[]string{
				"energy-monitor",
				"--messageWriteDelay", "200",
				"--history", "60",
			},
			config.EnergyMonitorConfig{
				MessageWriteDelay: 200,
				History:           60,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service := NewConfigService(logger.SetupMockLoggerService())

			service.Parse(test.args)

			energyConfig := service.GetEnergyMonitorConfig()

			if energyConfig.MessageWriteDelay != test.expected.MessageWriteDelay {
				t.Errorf("Expected MessageWriteDelay to be %d, got %d", test.expected.MessageWriteDelay, energyConfig.MessageWriteDelay)
			}
			if energyConfig.History != test.expected.History {
				t.Errorf("Expected History to be %d, got %d", test.expected.History, energyConfig.History)
			}
		})
	}
}

func TestGetOctopusAPIKey(t *testing.T) {
	t.Run("panics when API key file doesn't exist", func(t *testing.T) {
		service := NewConfigService(logger.SetupMockLoggerService())
		service.Parse([]string{"energy-monitor", "--octopusApiKey", "/nonexistent/file"})

		defer func() {
			if panicValue := recover(); panicValue == nil {
				t.Errorf("Expected GetOctopusAPIKey to panic when API key file doesn't exist")
			}
		}()

		service.GetOctopusAPIKey()
	})
}

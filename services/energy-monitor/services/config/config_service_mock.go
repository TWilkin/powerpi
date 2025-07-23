package config

import (
	commonConfigService "powerpi/common/services/config"
	"powerpi/energy-monitor/config"
)

type MockConfigService struct {
	commonConfigService.ConfigService

	TestEnergyMonitorConfig config.EnergyMonitorConfig
	TestOctopusAPIKey       *string
}

func (service MockConfigService) Parse(args []string) {
	// Mock implementation of Parse method
}

func (service MockConfigService) GetEnergyMonitorConfig() config.EnergyMonitorConfig {
	return service.TestEnergyMonitorConfig
}

func (service MockConfigService) GetOctopusAPIKey() *string {
	return service.TestOctopusAPIKey
}

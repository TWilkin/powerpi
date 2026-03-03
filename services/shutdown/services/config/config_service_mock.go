package config

import (
	commonConfigService "powerpi/common/services/config"
	"powerpi/shutdown/config"
)

type MockConfigService struct {
	commonConfigService.ConfigService

	TestConfig config.Config
}

func (config MockConfigService) Parse(args []string) {
	// Mock implementation of Parse method
}

func (config MockConfigService) Config() config.Config {
	return config.TestConfig
}

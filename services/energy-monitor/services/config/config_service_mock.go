package config

import (
	"github.com/stretchr/testify/mock"

	commonModels "github.com/TWilkin/powerpi/common/models"
	commonConfigService "github.com/TWilkin/powerpi/common/services/config"
	"github.com/TWilkin/powerpi/energy-monitor/config"
)

type MockConfigService struct {
	mock.Mock
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

func (service *MockConfigService) GetConfig(configType commonModels.ConfigType) (map[string]any, error) {
	args := service.Called(configType)
	return args.Get(0).(map[string]any), args.Error(1)
}

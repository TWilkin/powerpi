package config

import (
	"github.com/spf13/pflag"
	"github.com/stretchr/testify/mock"

	"powerpi/common/config"
	"powerpi/common/models"
)

type MockConfigService struct {
	mock.Mock
}

func (service *MockConfigService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	service.Called(args, flags)
}

func (service *MockConfigService) MqttConfig() config.MqttConfig {
	args := service.Called()
	return args.Get(0).(config.MqttConfig)
}

func (service *MockConfigService) GetMqttPassword() *string {
	args := service.Called()
	return args.Get(0).(*string)
}

func (service *MockConfigService) RequiredConfig() []models.ConfigType {
	args := service.Called()
	return args.Get(0).([]models.ConfigType)
}

func (service *MockConfigService) GetConfig(configType models.ConfigType) models.Config {
	args := service.Called(configType)
	return args.Get(0).(models.Config)
}

func (service *MockConfigService) SetConfig(configType models.ConfigType, data map[string]any, checksum string) {
	service.Called(configType, data, checksum)
}

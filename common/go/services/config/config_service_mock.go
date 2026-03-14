package config

import (
	"github.com/spf13/pflag"
	"github.com/stretchr/testify/mock"

	"github.com/TWilkin/powerpi/common/config"
	"github.com/TWilkin/powerpi/common/models"
)

type MockConfigService struct {
	mock.Mock
}

func (service *MockConfigService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	service.Called(args, flags)
}

func (service *MockConfigService) EnvironmentOverride(flagSet *pflag.FlagSet, flag string, envKey string) {
	service.Called(flagSet, flag, envKey)
}

func (service *MockConfigService) ReadPasswordFile(filePath string) (*string, error) {
	args := service.Called(filePath)
	return args.Get(0).(*string), args.Error(1)
}

func (service *MockConfigService) MqttConfig() config.MqttConfig {
	args := service.Called()
	return args.Get(0).(config.MqttConfig)
}

func (service *MockConfigService) GetMqttPassword() *string {
	args := service.Called()
	return args.Get(0).(*string)
}

func (service *MockConfigService) GetConfig(configType models.ConfigType) (map[string]any, error) {
	args := service.Called(configType)
	return args.Get(0).(map[string]any), args.Error(1)
}

func (service *MockConfigService) SetConfig(configType models.ConfigType, data map[string]any, checksum string) {
	service.Called(configType, data, checksum)
}

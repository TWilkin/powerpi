package config

import (
	"github.com/spf13/pflag"
	"github.com/stretchr/testify/mock"

	"powerpi/common/config"
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

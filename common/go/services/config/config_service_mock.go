package config

import (
	"github.com/spf13/pflag"

	"powerpi/common/config"
)

type MockConfigService struct {
	Mqtt config.MqttConfig
}

func (config MockConfigService) Parse(args []string, flags ...pflag.FlagSet) {
	// Mock implementation of Parse method
}

func (config MockConfigService) MqttConfig() config.MqttConfig {
	return config.Mqtt
}

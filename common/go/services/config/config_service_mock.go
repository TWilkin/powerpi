package config

import (
	"github.com/spf13/pflag"

	"powerpi/common/config"
)

type MockConfigService struct {
	Mqtt config.MqttConfig
}

func (config MockConfigService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	// Mock implementation of ParseWithFlags method
}

func (config MockConfigService) MqttConfig() config.MqttConfig {
	return config.Mqtt
}

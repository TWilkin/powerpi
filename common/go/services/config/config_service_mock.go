package config

import "powerpi/common/config"

type MockConfigService struct {
	Mqtt config.MqttConfig
}

func (config MockConfigService) Parse(args []string) {
	// Mock implementation of Parse method
}

func (config MockConfigService) MqttConfig() config.MqttConfig {
	return config.Mqtt
}

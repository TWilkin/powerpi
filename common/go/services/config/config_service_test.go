package config

import (
	"testing"

	"powerpi/common/config"
)

func TestParse(t *testing.T) {
	var tests = []struct {
		name     string
		args     []string
		expected config.MqttConfig
	}{
		{
			"default values",
			[]string{"my service"},
			config.MqttConfig{
				Host:         "localhost",
				Port:         1883,
				User:         "device",
				PasswordFile: "undefined",
				TopicBase:    "powerpi",
			},
		},
		{
			"overridden values",
			[]string{
				"my service",
				"--host", "mqtt-host",
				"--port", "8883",
				"--user", "user",
				"--password", "password",
				"--topic", "custom-topic",
			},
			config.MqttConfig{
				Host:         "mqtt-host",
				Port:         8883,
				User:         "user",
				PasswordFile: "password",
				TopicBase:    "custom-topic",
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {

			service := NewConfigService()

			service.Parse(test.args)

			mqttConfig := service.MqttConfig()

			if mqttConfig.Host != test.expected.Host {
				t.Errorf("Expected host to be '%s', got '%s'", test.expected.Host, mqttConfig.Host)
			}
			if mqttConfig.Port != test.expected.Port {
				t.Errorf("Expected port to be %d, got %d", test.expected.Port, mqttConfig.Port)
			}
			if mqttConfig.User != test.expected.User {
				t.Errorf("Expected user to be '%s', got '%s'", test.expected.User, mqttConfig.User)
			}
			if mqttConfig.PasswordFile != test.expected.PasswordFile {
				t.Errorf("Expected password file to be '%s', got '%s'", test.expected.PasswordFile, mqttConfig.PasswordFile)
			}
			if mqttConfig.TopicBase != test.expected.TopicBase {
				t.Errorf("Expected topic base to be '%s', got '%s'", test.expected.TopicBase, mqttConfig.TopicBase)
			}
		})
	}
}

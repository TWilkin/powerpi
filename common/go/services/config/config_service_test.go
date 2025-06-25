package config

import (
	"testing"

	"powerpi/common/config"
	"powerpi/common/services/logger"
)

func TestParseWithFlags(t *testing.T) {
	var tests = []struct {
		name        string
		args        []string
		environment map[string]string
		expected    config.MqttConfig
	}{
		{
			"default values",
			[]string{"my service"},
			map[string]string{},
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
			map[string]string{},
			config.MqttConfig{
				Host:         "mqtt-host",
				Port:         8883,
				User:         "user",
				PasswordFile: "password",
				TopicBase:    "custom-topic",
			},
		},
		{
			"environment overridden values",
			[]string{
				"my service",
			},
			map[string]string{
				"MQTT_HOST":        "mqtt-host",
				"MQTT_PORT":        "8883",
				"MQTT_USER":        "user",
				"MQTT_SECRET_FILE": "password",
				"TOPIC_BASE":       "custom-topic",
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
			for key, value := range test.environment {
				t.Setenv(key, value)
			}

			service := NewConfigService(logger.SetupMockLoggerService())

			service.ParseWithFlags(test.args)

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

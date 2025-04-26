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
			[]string{},
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

			if service.Mqtt.Host != test.expected.Host {
				t.Errorf("Expected host to be '%s', got '%s'", test.expected.Host, service.Mqtt.Host)
			}
			if service.Mqtt.Port != test.expected.Port {
				t.Errorf("Expected port to be %d, got %d", test.expected.Port, service.Mqtt.Port)
			}
			if service.Mqtt.User != test.expected.User {
				t.Errorf("Expected user to be '%s', got '%s'", test.expected.User, service.Mqtt.User)
			}
			if service.Mqtt.PasswordFile != test.expected.PasswordFile {
				t.Errorf("Expected password file to be '%s', got '%s'", test.expected.PasswordFile, service.Mqtt.PasswordFile)
			}
			if service.Mqtt.TopicBase != test.expected.TopicBase {
				t.Errorf("Expected topic base to be '%s', got '%s'", test.expected.TopicBase, service.Mqtt.TopicBase)
			}
		})
	}
}

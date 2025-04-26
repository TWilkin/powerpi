package config

import (
	"flag"

	"powerpi/common/config"
)

type configService interface {
	Parse(args []string)

	MqttConfig() config.MqttConfig
}

type ConfigService struct {
	Mqtt config.MqttConfig
}

func NewConfigService() *ConfigService {
	return &ConfigService{
		Mqtt: config.MqttConfig{},
	}
}

func (service *ConfigService) Parse(args []string) {
	flagSet := flag.NewFlagSet("", flag.ContinueOnError)

	// MQTT
	flagSet.StringVar(&service.Mqtt.Host, "host", "localhost", "The hostname of the MQTT broker")
	flagSet.IntVar(&service.Mqtt.Port, "port", 1883, "The port number for the MQTT broker")
	flagSet.StringVar(&service.Mqtt.User, "user", "device", "The username for the MQTT broker")
	flagSet.StringVar(&service.Mqtt.PasswordFile, "password", "undefined", "The path to the password file")
	flagSet.StringVar(&service.Mqtt.TopicBase, "topic", "powerpi", "The topic base for the MQTT broker")

	err := flagSet.Parse(args)
	if err != nil {
		panic(err)
	}
}

func (service ConfigService) MqttConfig() config.MqttConfig {
	return service.Mqtt
}

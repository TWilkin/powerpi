package config

import (
	"flag"

	"powerpi/common/config"
)

type ConfigService interface {
	Parse(args []string)

	MqttConfig() config.MqttConfig
}

type configService struct {
	mqtt config.MqttConfig
}

func NewConfigService() ConfigService {
	service := &configService{
		mqtt: config.MqttConfig{},
	}

	return service
}

func (service *configService) Parse(args []string) {
	flagSet := flag.NewFlagSet("", flag.ContinueOnError)

	// MQTT
	flagSet.StringVar(&service.mqtt.Host, "host", "localhost", "The hostname of the MQTT broker")
	flagSet.IntVar(&service.mqtt.Port, "port", 1883, "The port number for the MQTT broker")
	flagSet.StringVar(&service.mqtt.User, "user", "device", "The username for the MQTT broker")
	flagSet.StringVar(&service.mqtt.PasswordFile, "password", "undefined", "The path to the password file")
	flagSet.StringVar(&service.mqtt.TopicBase, "topic", "powerpi", "The topic base for the MQTT broker")

	err := flagSet.Parse(args)
	if err != nil {
		panic(err)
	}
}

func (service configService) MqttConfig() config.MqttConfig {
	return service.mqtt
}

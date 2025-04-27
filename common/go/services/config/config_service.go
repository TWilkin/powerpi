package config

import (
	"github.com/spf13/pflag"

	"powerpi/common/config"
)

type ConfigService interface {
	ParseWithFlags(args []string, flags ...pflag.FlagSet)

	MqttConfig() config.MqttConfig
}

type configService struct {
	mqtt config.MqttConfig
}

func NewConfigService() ConfigService {
	return &configService{
		mqtt: config.MqttConfig{},
	}
}

func (service *configService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	// MQTT
	mqtt := pflag.NewFlagSet("mqtt", pflag.ExitOnError)
	mqtt.StringVar(&service.mqtt.Host, "host", "localhost", "The hostname of the MQTT broker")
	mqtt.IntVar(&service.mqtt.Port, "port", 1883, "The port number for the MQTT broker")
	mqtt.StringVar(&service.mqtt.User, "user", "device", "The username for the MQTT broker")
	mqtt.StringVar(&service.mqtt.PasswordFile, "password", "undefined", "The path to the password file")
	mqtt.StringVar(&service.mqtt.TopicBase, "topic", "powerpi", "The topic base for the MQTT broker")

	name := args[0]
	params := args[1:]

	combined := pflag.NewFlagSet(name, pflag.ExitOnError)
	combined.AddFlagSet(mqtt)
	for _, flag := range flags {
		combined.AddFlagSet(&flag)
	}

	err := combined.Parse(params)
	if err != nil {
		panic(err)
	}
}

func (service configService) MqttConfig() config.MqttConfig {
	return service.mqtt
}

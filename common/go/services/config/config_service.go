package config

import (
	"log"
	"os"
	"strings"

	"github.com/spf13/pflag"

	"powerpi/common/config"
)

type ConfigService interface {
	ParseWithFlags(args []string, flags ...pflag.FlagSet)

	MqttConfig() config.MqttConfig
	GetMqttPassword() *string
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
		flagCopy := flag

		combined.AddFlagSet(&flagCopy)
	}

	err := combined.Parse(params)
	if err != nil {
		panic(err)
	}
}

func (service *configService) MqttConfig() config.MqttConfig {
	return service.mqtt
}

func (service *configService) GetMqttPassword() *string {
	passwordFile := service.mqtt.PasswordFile

	var password *string
	password = nil

	if passwordFile != "undefined" {
		// check the password file permissions
		info, err := os.Stat(passwordFile)
		if err != nil {
			panic(err)
		}

		permissions := info.Mode().Perm()
		if permissions != 0o600 {
			log.Fatalf("Incorrect permissions (0%o), must be 0600 on '%s'", permissions, passwordFile)
		}

		data, err := os.ReadFile(passwordFile)
		if err != nil {
			panic(err)
		}

		str := string(data)
		str = strings.TrimSpace(str)
		password = &str
	}

	return password
}

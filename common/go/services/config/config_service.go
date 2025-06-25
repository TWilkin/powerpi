package config

import (
	"os"
	"strings"

	"github.com/spf13/pflag"

	"powerpi/common/config"
	"powerpi/common/models"
	"powerpi/common/services/logger"
)

type ConfigService interface {
	ParseWithFlags(args []string, flags ...pflag.FlagSet)

	MqttConfig() config.MqttConfig
	GetMqttPassword() *string

	RequiredConfig() []models.ConfigType
	GetConfig(configType models.ConfigType) models.Config
	SetConfig(configType models.ConfigType, data map[string]any, checksum string)
}

type configService struct {
	mqtt   config.MqttConfig
	logger logger.LoggerService

	// config map
	configMap map[models.ConfigType]models.Config
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		mqtt:   config.MqttConfig{},
		logger: logger,
	}
}

func (service *configService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	// built-in flags
	builtIn := pflag.NewFlagSet("built-in", pflag.ExitOnError)
	builtIn.String("log-level", "INFO", "The log level for the application")

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
	combined.AddFlagSet(builtIn)
	combined.AddFlagSet(mqtt)
	for _, flag := range flags {
		flagCopy := flag

		combined.AddFlagSet(&flagCopy)
	}

	err := combined.Parse(params)
	if err != nil {
		panic(err)
	}

	// built-in environment overrides
	service.environmentOverride(builtIn, "log-level", "LOG_LEVEL")

	// MQTT environment overrides
	service.environmentOverride(combined, "host", "MQTT_HOST") // TODO merge these into MQTT_ADDRESS like other services
	service.environmentOverride(combined, "port", "MQTT_PORT")
	service.environmentOverride(combined, "user", "MQTT_USER")
	service.environmentOverride(combined, "password", "MQTT_SECRET_FILE")
	service.environmentOverride(combined, "topic", "TOPIC_BASE")

	// set the log level
	service.logger.SetLevel(combined.Lookup("log-level").Value.String())
}

func (service *configService) environmentOverride(flagSet *pflag.FlagSet, flag string, envKey string) {
	if flagSet.Lookup(flag).Changed {
		return
	}

	envValue, exists := os.LookupEnv(envKey)
	if exists && envValue != "" {
		flagSet.Set(flag, envValue)
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
			service.logger.Error("Incorrect permissions (0%o), must be 0600 on '%s'", permissions, passwordFile)
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

func (service *configService) RequiredConfig() []models.ConfigType {
	return []models.ConfigType{}
}

func (service *configService) GetConfig(configType models.ConfigType) models.Config {
	config, found := service.configMap[configType]
	if !found {
		panic("Config not found")
	}

	return config
}

func (service *configService) SetConfig(configType models.ConfigType, data map[string]any, checksum string) {
	if service.configMap == nil {
		service.configMap = make(map[models.ConfigType]models.Config)
	}

	config := models.Config{
		Data:     data,
		Checksum: checksum,
	}

	service.configMap[configType] = config
}

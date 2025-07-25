package config

import (
	"net/url"
	"os"
	"strings"

	"github.com/spf13/pflag"

	"powerpi/common/config"
	"powerpi/common/models"
	"powerpi/common/services/logger"
)

type ConfigService interface {
	ParseWithFlags(args []string, flags ...pflag.FlagSet)
	EnvironmentOverride(flagSet *pflag.FlagSet, flag string, envKey string)
	ReadPasswordFile(filePath string) (*string, error)

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
	mqtt.StringVar(&service.mqtt.Host, "host", "mosquitto", "The hostname of the MQTT broker")
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
	service.EnvironmentOverride(builtIn, "log-level", "LOG_LEVEL")

	// MQTT environment overrides
	service.EnvironmentOverride(combined, "host", "MQTT_HOST")
	service.EnvironmentOverride(combined, "port", "MQTT_PORT")
	service.readMQTTAddress(combined, "MQTT_ADDRESS")
	service.EnvironmentOverride(combined, "user", "MQTT_USER")
	service.EnvironmentOverride(combined, "password", "MQTT_SECRET_FILE")
	service.EnvironmentOverride(combined, "topic", "TOPIC_BASE")

	// set the log level
	service.logger.SetLevel(combined.Lookup("log-level").Value.String())
}

func (service *configService) EnvironmentOverride(flagSet *pflag.FlagSet, flag string, envKey string) {
	if flagSet.Lookup(flag).Changed {
		return
	}

	envValue, exists := os.LookupEnv(envKey)
	if exists && envValue != "" {
		flagSet.Set(flag, envValue)
	}
}

func (service *configService) ReadPasswordFile(passwordFile string) (*string, error) {
	var password *string

	if passwordFile != "undefined" {
		// check the password file permissions
		info, err := os.Stat(passwordFile)
		if err != nil {
			return nil, err
		}

		permissions := info.Mode().Perm()
		if permissions != 0o600 {
			service.logger.Warn("Open permissions on password file", "file", passwordFile, "permission", permissions)
		}

		data, err := os.ReadFile(passwordFile)
		if err != nil {
			return nil, err
		}

		str := string(data)
		str = strings.TrimSpace(str)
		password = &str
	}

	return password, nil
}

func (service *configService) MqttConfig() config.MqttConfig {
	return service.mqtt
}

func (service *configService) GetMqttPassword() *string {
	password, err := service.ReadPasswordFile(service.mqtt.PasswordFile)
	if err != nil {
		service.logger.Error("Failed to read MQTT password file", "error", err)
		panic(err)
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

func (service *configService) readMQTTAddress(flagSet *pflag.FlagSet, envKey string) {
	if flagSet.Lookup("host").Changed || flagSet.Lookup("port").Changed {
		return
	}

	envValue, exists := os.LookupEnv(envKey)
	if exists && envValue != "" {
		url, err := url.Parse(envValue)
		if err != nil {
			service.logger.Error("Failed to parse MQTT address", "error", err)
			return
		}

		flagSet.Set("host", url.Hostname())
		if port := url.Port(); port != "" {
			flagSet.Set("port", port)
		}
	}

}

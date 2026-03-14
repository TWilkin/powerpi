package config

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/spf13/pflag"

	"github.com/TWilkin/powerpi/common/config"
	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/logger"
)

type ConfigService interface {
	ParseWithFlags(args []string, flags ...pflag.FlagSet)
	EnvironmentOverride(flagSet *pflag.FlagSet, flag string, envKey string)
	ReadPasswordFile(filePath string) (*string, error)

	MqttConfig() config.MqttConfig
	GetMqttPassword() *string

	GetConfig(configType models.ConfigType) (map[string]any, error)
}

type configService struct {
	mqtt   config.MqttConfig
	logger logger.LoggerService

	files map[models.ConfigType]string
}

type ConfigOption func(*configService)

func WithRequiredConfigFile(configs ...models.ConfigType) ConfigOption {
	return func(service *configService) {
		for _, configType := range configs {
			service.files[configType] = ""
		}
	}
}

func NewConfigService(logger logger.LoggerService, options ...ConfigOption) ConfigService {
	service := &configService{
		mqtt:   config.MqttConfig{},
		logger: logger,

		files: map[models.ConfigType]string{},
	}

	for _, option := range options {
		option(service)
	}

	return service
}

func (service *configService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	// built-in flags
	builtIn := pflag.NewFlagSet("built-in", pflag.ExitOnError)
	builtIn.String("log-level", "INFO", "The log level for the application")

	// Config Files
	getConfigFileFlag := func(configType models.ConfigType) (string, string) {
		configName := string(configType)
		configFlag := fmt.Sprintf("%sFile", configName)

		return configName, configFlag
	}

	configFiles := pflag.NewFlagSet("config", pflag.ExitOnError)
	for configType := range service.files {
		configName, configFlag := getConfigFileFlag(configType)

		configFiles.String(
			configFlag,
			"undefined",
			fmt.Sprintf("The path to the %s config file", configName),
		)
	}

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
	combined.AddFlagSet(configFiles)
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
	service.EnvironmentOverride(combined, "log-level", "LOG_LEVEL")

	// Config file environment overrides
	for configType := range service.files {
		configName, configFlag := getConfigFileFlag(configType)

		service.EnvironmentOverride(
			combined,
			configFlag,
			fmt.Sprintf("%s_FILE", strings.ToUpper(configName)),
		)
	}

	// MQTT environment overrides
	service.EnvironmentOverride(combined, "host", "MQTT_HOST")
	service.EnvironmentOverride(combined, "port", "MQTT_PORT")
	service.readMQTTAddress(combined, "MQTT_ADDRESS")
	service.EnvironmentOverride(combined, "user", "MQTT_USER")
	service.EnvironmentOverride(combined, "password", "MQTT_SECRET_FILE")
	service.EnvironmentOverride(combined, "topic", "TOPIC_BASE")

	// set the log level
	service.logger.SetLevel(combined.Lookup("log-level").Value.String())

	// Set the config file paths
	for configType := range service.files {
		_, configFlag := getConfigFileFlag(configType)
		service.files[configType] = combined.Lookup(configFlag).Value.String()
	}
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
		if permissions&0o177 != 0 {
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

func (service *configService) GetConfig(configType models.ConfigType) (map[string]any, error) {
	fileName := service.files[configType]
	service.logger.Info("Reading config file", "fileName", fileName)

	data, err := os.ReadFile(fileName)
	if err != nil {
		return nil, err
	}

	var config map[string]any
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	return config, nil
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

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

type flagGroup struct {
	build       func() *pflag.FlagSet
	environment func(*pflag.FlagSet)
	apply       func(*pflag.FlagSet)
}

func (service *configService) ParseWithFlags(args []string, flags ...pflag.FlagSet) {
	groups := []flagGroup{
		service.addBuiltInFlags(),
		service.addConfigFileFlags(),
		service.addMQTTFlags(),
	}

	name := args[0]
	params := args[1:]

	combined := pflag.NewFlagSet(name, pflag.ExitOnError)

	for _, group := range groups {
		combined.AddFlagSet(group.build())
	}

	for _, flag := range flags {
		flagCopy := flag

		combined.AddFlagSet(&flagCopy)
	}

	err := combined.Parse(params)
	if err != nil {
		panic(err)
	}

	// override with environment variables
	for _, group := range groups {
		group.environment(combined)
	}

	// apply the configuration
	for _, group := range groups {
		if group.apply != nil {
			group.apply(combined)
		}
	}
}

func (service *configService) addBuiltInFlags() flagGroup {
	const logLevelFlag = "logLevel"

	build := func() *pflag.FlagSet {
		builtIn := pflag.NewFlagSet("built-in", pflag.ExitOnError)
		builtIn.String(logLevelFlag, "INFO", "The log level for the application")
		return builtIn
	}

	environment := func(flagSet *pflag.FlagSet) {
		service.EnvironmentOverride(flagSet, logLevelFlag, "LOG_LEVEL")
	}

	apply := func(flagSet *pflag.FlagSet) {
		service.logger.SetLevel(flagSet.Lookup(logLevelFlag).Value.String())
	}

	return flagGroup{build, environment, apply}
}

func (service *configService) addMQTTFlags() flagGroup {
	build := func() *pflag.FlagSet {
		mqtt := pflag.NewFlagSet("mqtt", pflag.ExitOnError)
		mqtt.StringVar(&service.mqtt.Host, "host", "mosquitto", "The hostname of the MQTT broker")
		mqtt.IntVar(&service.mqtt.Port, "port", 1883, "The port number for the MQTT broker")
		mqtt.StringVar(&service.mqtt.User, "user", "device", "The username for the MQTT broker")
		mqtt.StringVar(&service.mqtt.PasswordFile, "password", "undefined", "The path to the password file")
		mqtt.StringVar(&service.mqtt.TopicBase, "topic", "powerpi", "The topic base for the MQTT broker")
		return mqtt
	}

	environment := func(flagSet *pflag.FlagSet) {
		service.EnvironmentOverride(flagSet, "host", "MQTT_HOST")
		service.EnvironmentOverride(flagSet, "port", "MQTT_PORT")
		service.readMQTTAddress(flagSet, "MQTT_ADDRESS")
		service.EnvironmentOverride(flagSet, "user", "MQTT_USER")
		service.EnvironmentOverride(flagSet, "password", "MQTT_SECRET_FILE")
		service.EnvironmentOverride(flagSet, "topic", "TOPIC_BASE")
	}

	return flagGroup{build, environment, nil}
}

func (service *configService) addConfigFileFlags() flagGroup {
	getConfigFileFlag := func(configType models.ConfigType) (string, string) {
		configName := string(configType)
		configFlag := fmt.Sprintf("%sFile", configName)

		return configName, configFlag
	}

	build := func() *pflag.FlagSet {
		configFiles := pflag.NewFlagSet("config", pflag.ExitOnError)

		for configType := range service.files {
			configName, configFlag := getConfigFileFlag(configType)

			configFiles.String(
				configFlag,
				"undefined",
				fmt.Sprintf("The path to the %s config file", configName),
			)
		}

		return configFiles
	}

	environment := func(flagSet *pflag.FlagSet) {
		for configType := range service.files {
			configName, configFlag := getConfigFileFlag(configType)

			service.EnvironmentOverride(
				flagSet,
				configFlag,
				fmt.Sprintf("%s_FILE", strings.ToUpper(configName)),
			)
		}
	}

	apply := func(flagSet *pflag.FlagSet) {
		for configType := range service.files {
			_, configFlag := getConfigFileFlag(configType)
			service.files[configType] = flagSet.Lookup(configFlag).Value.String()
		}
	}

	return flagGroup{build, environment, apply}
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

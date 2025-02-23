package flags

import (
	"flag"
)

type Config struct {
	Mqtt            MqttConfig
	AdditionalState AdditionalStateConfig

	AllowQuickShutdown bool
	Mock               bool
}

type MqttConfig struct {
	Host         string
	Port         int
	User         string
	PasswordFile string
	TopicBase    string
}

type AdditionalStateConfig struct {
	Brightness BrightnessConfig
}

type BrightnessConfig struct {
	Device string
	Min    float64
	Max    float64
}

func ParseFlags() Config {
	var config Config

	// MQTT
	flag.StringVar(&config.Mqtt.Host, "host", "localhost", "The hostname of the MQTT broker")
	flag.IntVar(&config.Mqtt.Port, "port", 1883, "The port number for the MQTT broker")
	flag.StringVar(&config.Mqtt.User, "user", "device", "The username for the MQTT broker")
	flag.StringVar(&config.Mqtt.PasswordFile, "password", "undefined", "The path to the password file")
	flag.StringVar(&config.Mqtt.TopicBase, "topic", "powerpi", "The topic base for the MQTT broker")

	// additional state
	// brightness
	flag.StringVar(
		&config.AdditionalState.Brightness.Device,
		"brightnessDevice",
		"",
		"The path to the device to use for controller brightness, e.g. \"/sys/class/backlight/10-0045/brightness\" for a Pi Touch Display 2",
	)
	flag.Float64Var(
		&config.AdditionalState.Brightness.Min,
		"brightnessMin",
		0.0,
		"The minimum value supported for the brightness setting, e.g. 0 for a Pi Touch Display 2",
	)
	flag.Float64Var(
		&config.AdditionalState.Brightness.Max,
		"brightnessMax",
		100.0,
		"The maximum value supported for the brightness setting, e.g. 31 for a Pi Touch Display 2",
	)

	// others
	flag.BoolVar(
		&config.AllowQuickShutdown,
		"allowQuickShutdown",
		false,
		"If true allow a message within 2 minutes of service starting to initiate a shutdown",
	)
	flag.BoolVar(&config.Mock, "mock", false, "Whether to actually shutdown or not")

	flag.Parse()

	return config
}

package config

type AdditionalStateConfig struct {
	Brightness BrightnessConfig
}

type BrightnessConfig struct {
	Device string
	Min    float64
	Max    float64
}

type Config struct {
	AdditionalState AdditionalStateConfig

	AllowQuickShutdown bool
	Mock               bool
}

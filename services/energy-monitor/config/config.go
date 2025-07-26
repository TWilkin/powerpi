package config

type EnergyMonitorConfig struct {
	MessageWriteDelay int32
	History           int
}

type OctopusConfig struct {
	ApiKeyFile string
}

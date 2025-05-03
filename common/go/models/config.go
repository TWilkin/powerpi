package models

type ConfigType string

const (
	ConfigTypeDevices   ConfigType = "devices"
	ConfigTypeEvents    ConfigType = "events"
	ConfigTypeSchedules ConfigType = "schedules"
	ConfigTypeUsers     ConfigType = "users"
)

type Config struct {
	Data     any
	Checksum string
}

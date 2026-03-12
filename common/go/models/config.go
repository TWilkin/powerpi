package models

type ConfigType string

const (
	ConfigTypeDevices   ConfigType = "devices"
	ConfigTypeEvents    ConfigType = "events"
	ConfigTypeFloorplan ConfigType = "floorplan"
	ConfigTypeSchedules ConfigType = "schedules"
	ConfigTypeUsers     ConfigType = "users"
)

type Config struct {
	Data     map[string]any
	Checksum string
}

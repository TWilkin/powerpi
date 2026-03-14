package models

type ConfigType string

const (
	ConfigTypeDevices   ConfigType = "devices"
	ConfigTypeEvents    ConfigType = "events"
	ConfigTypeFloorplan ConfigType = "floorplan"
	ConfigTypeSchedules ConfigType = "schedules"
	ConfigTypeUsers     ConfigType = "users"
)

var ConfigTypes = []ConfigType{
	ConfigTypeDevices,
	ConfigTypeEvents,
	ConfigTypeFloorplan,
	ConfigTypeSchedules,
	ConfigTypeUsers,
}

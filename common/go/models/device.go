package models

type BaseDevice struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Type        string `json:"type"`
	Location    string `json:"location"`
	Visible     bool   `json:"visible"`
}

type Device struct {
	BaseDevice
}

type DeviceState string

const (
	On  DeviceState = "on"
	Off DeviceState = "off"
)

type AdditionalState struct {
	Brightness *int `json:"brightness,omitempty"`
}

type Capability struct {
	Brightness bool `json:"brightness,omitempty"`
}

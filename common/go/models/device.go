package models

type BaseDevice struct {
	Name string `json:"name"`
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

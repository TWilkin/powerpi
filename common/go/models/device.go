package models

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

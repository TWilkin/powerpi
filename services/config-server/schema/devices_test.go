package schema

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/models"
)

type wrapper struct {
	Devices []json.RawMessage `json:"devices"`
	Sensors []json.RawMessage `json:"sensors"`
}

func init() {
	devicesWrapper := wrapper{
		Devices: []json.RawMessage{},
		Sensors: []json.RawMessage{},
	}

	commonSensorCases := []Case{
		{"missing type", "/sensors/0/type", "remove", nil, false},

		{"missing name", "/sensors/0/name", "remove", nil, false},
		{"invalid name", "/sensors/0/name", "replace", ptr(`"123name"`), false},

		{"missing display_name", "/sensors/0/display_name", "remove", nil, true},
		{"missing location", "/sensors/0/location", "remove", nil, false},

		{"missing categories", "/sensors/0/categories", "remove", nil, true},
		{"invalid categories", "/sensors/0/categories", "replace", ptr("[1, 2]"), false},

		{"missing visible", "/sensors/0/visible", "remove", nil, true},
		{"invalid visible", "/sensors/0/visible", "replace", ptr(`"invalid"`), false},
		{"invalid visible truthy", "/sensors/0/visible", "replace", ptr("1"), false},
	}

	suites = append(suites, Suite{
		file:       "devices/PowerPiSensor.json",
		configType: models.ConfigTypeDevices,
		wrapper:    devicesWrapper,
		path:       "/sensors/0",
		cases:      commonSensorCases,
	})
}

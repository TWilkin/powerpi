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
		{"missing type", "type", "remove", nil, false},

		{"missing name", "name", "remove", nil, false},
		{"invalid name", "name", "replace", ptr(`"123name"`), false},

		{"missing display_name", "display_name", "remove", nil, true},
		{"missing location", "location", "remove", nil, false},

		{"missing categories", "categories", "remove", nil, true},
		{"invalid categories", "categories", "replace", ptr("[1, 2]"), false},

		{"missing visible", "visible", "remove", nil, true},
		{"invalid visible string", "visible", "replace", ptr(`"invalid"`), false},
		{"invalid visible truthy", "visible", "replace", ptr("1"), false},
	}

	suites = append(suites, Suite{
		file:       "devices/PowerPiSensor.json",
		configType: models.ConfigTypeDevices,
		wrapper:    devicesWrapper,
		path:       "/sensors/0",
		cases:      commonSensorCases,
	})
}

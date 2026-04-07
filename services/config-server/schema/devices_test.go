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
	deviceWrapper := wrapper{
		Devices: []json.RawMessage{},
		Sensors: []json.RawMessage{},
	}

	suites = append(suites, Suite{
		file:       "devices/PowerPiSensor.json",
		configType: models.ConfigTypeDevices,
		wrapper:    deviceWrapper,
		path:       "/sensors/0",
	})
}

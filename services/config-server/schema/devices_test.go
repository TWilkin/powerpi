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

	commonCases := merge(
		generateMissing("type", false),

		generateMissing("name", false),
		[]Case{
			{"invalid name regex", "name", "replace", strPtr(`"123name"`), false},
		},

		generateMissing("display_name", true),
		generateMissing("location", false),

		generateMissing("categories", true),
		[]Case{
			{"invalid categories", "categories", "replace", strPtr(`[1, 2]`), false},
		},

		generateBoolean("visible", true),
	)

	suites = append(suites, Suite{
		file:       "devices/PowerPiSensor.json",
		configType: models.ConfigTypeDevices,
		wrapper:    devicesWrapper,
		path:       "/sensors/0",
		cases: merge(
			commonCases,
			generateObject("metrics", false, false),
			[]Case{
				{"invalid metrics key", "metrics", "replace", strPtr(`{"test": "read"}`), false},
				{"invalid metrics value", "metrics", "replace", strPtr(`{"humidity": "test"}`), false},
			},

			generateNumeric("poll_delay", true, intPtr(1), nil),

			generateObject("dht22", true, true),
			generateNumeric("dht22/skip", true, intPtr(1), nil),

			generateObject("pir", true, true),
			generateNumeric("pir/init_delay", true, intPtr(1), nil),
			generateNumeric("pir/post_detect_skip", true, intPtr(1), nil),
			generateNumeric("pir/post_motion_check", true, intPtr(1), nil),
		),
	})
}

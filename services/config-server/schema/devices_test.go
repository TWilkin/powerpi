package schema

import (
	"encoding/json"
	"fmt"

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

		generateMissing("categories", true),
		[]Case{
			{"invalid categories", "categories", "replace", strPtr(`[1, 2]`), false},
		},

		generateBoolean("visible", true),

		[]Case{
			{"additional property", "prop", "add", strPtr(`"value"`), false},
		},
	)

	commonSensorCases := merge(
		commonCases,
		generateMissing("location", false),
	)

	commonDeviceCases := merge(
		commonCases,
		generateMissing("location", true),
	)

	commonPollableCases := generateNumeric("poll_frequency", true, nil, nil)

	commonZigBeeCases := merge(
		generateMissing("ieee", false),
		generateMissing("nwk", false),
		[]Case{
			{"invalid ieee", "ieee", "replace", strPtr(`"a"`), false},
			{"invalid nwk", "nwk", "replace", strPtr(`"a"`), false},
		},
	)

	suites = append(
		suites,
		Suite{
			file:       "devices/PowerPiSensor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       "/sensors/0",
			cases: merge(
				commonSensorCases,
				generateMetrics("humidity"),

				generateNumeric("poll_delay", true, intPtr(1), nil),

				generateObject("dht22", true, true),
				generateNumeric("dht22/skip", true, intPtr(1), nil),

				generateObject("pir", true, true),
				generateNumeric("pir/init_delay", true, intPtr(1), nil),
				generateNumeric("pir/post_detect_skip", true, intPtr(1), nil),
				generateNumeric("pir/post_motion_check", true, intPtr(1), nil),
			),
		},

		// ZigBee
		Suite{
			file:       "devices/zigbee/ZigBeeSocket.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       "/devices/0",
			cases: merge(
				commonDeviceCases,
				commonZigBeeCases,
				commonPollableCases,
			),
		},
	)
}

func generateMetrics(key string) []Case {
	return merge(
		generateObject("metrics", false, false),
		[]Case{
			{"invalid metrics key", "metrics", "replace", strPtr(`{"test": "read"}`), false},
			{"invalid metrics value", "metrics", "replace", strPtr(fmt.Sprintf(`{"%s": "test"}`, key)), false},
		},
	)
}

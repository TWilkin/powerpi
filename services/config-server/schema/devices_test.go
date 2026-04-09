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

	devicePath := "/devices/0"
	sensorPath := "/sensors/0"

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
		// Energenie
		Suite{
			file:       "devices/energenie/EnergeniePairing.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("timeout", true, intPtr(1), nil),
			),
		},

		Suite{
			file:       "devices/energenie/EnergenieSocket.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("device_id", true, intPtr(0), intPtr(4)),
			),
		},

		Suite{
			file:       "devices/energenie/EnergenieSocketGroup.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("home_id", false, intPtr(0), intPtr(15)),
				generateArray("devices", false, false, "1"),
			),
		},

		// Energy Monitor
		Suite{
			file:       "devices/energy-monitor/OctopusElectricityMeter.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("electricity"),
				generateString("serial_number", false, true, nil),
				generateString("mpan", false, false, strPtr("12345")),
			),
		},

		Suite{
			file:       "devices/energy-monitor/OctopusGasMeter.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("gas"),
				generateString("serial_number", false, true, nil),
				generateString("mprn", false, false, strPtr("12345")),
				generateEnum("generation", false, false, strPtr("SMETS0"), "SMETS1", "SMETS2"),
			),
		},

		// PowerPi
		Suite{
			file:       "devices/PowerPiSensor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("humidity", "motion", "temperature"),

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
			file:       "devices/zigbee/AqaraDoor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
				generateMetrics("door"),
			),
		},

		Suite{
			file:       "devices/zigbee/AqaraWindow.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
				generateMetrics("window"),
			),
		},

		Suite{
			file:       "devices/zigbee/IkeaStyrbar.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		Suite{
			file:       "devices/zigbee/OsramSwitchMini.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		Suite{
			file:       "devices/zigbee/SonoffSwitch.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		Suite{
			file:       "devices/zigbee/ZigBeeEnergyMonitor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
				generateMetrics("power", "current", "voltage"),
			),
		},

		Suite{
			file:       "devices/zigbee/ZigBeeLight.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonZigBeeCases,
				generateNumeric("duration", true, intPtr(0), nil),
			),
		},

		Suite{
			file:       "devices/zigbee/ZigBeePairing.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("timeout", true, intPtr(1), nil),
			),
		},

		Suite{
			file:       "devices/zigbee/ZigBeeSocket.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonZigBeeCases,
				commonPollableCases,
			),
		},
	)
}

func generateMetrics(keys ...string) []Case {
	cases := generateObject("metrics", false, false)

	for _, key := range keys {
		cases = merge(
			cases,
			generateEnum(fmt.Sprintf("metrics/%s", key), len(keys) > 1, false, strPtr("test"), "none", "read", "visible"),
		)
	}

	return cases
}

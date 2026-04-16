package schema

import (
	"encoding/json"
	"fmt"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
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

	commonAbstractDeviceCases := merge(
		generateMissing("type", false),

		generateMissing("name", false),
		[]schemaCase{
			{"invalid name regex", []schemaPatch{{"name", "replace", utils.ToPtr(`"123name"`)}}, false},
		},

		generateMissing("display_name", true),

		[]schemaCase{
			{"additional property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
		},
	)

	commonBaseDeviceCases := merge(
		commonAbstractDeviceCases,

		generateMissing("categories", true),
		[]schemaCase{
			{"invalid categories", []schemaPatch{{"categories", "replace", utils.ToPtr(`[1, 2]`)}}, false},
		},

		generateBoolean("visible", true),
	)

	commonSensorCases := merge(
		commonBaseDeviceCases,
		generateMissing("location", false),
	)

	commonDeviceCases := merge(
		commonBaseDeviceCases,
		generateMissing("location", true),
	)

	commonPollableCases := generateNumeric[int]("poll_frequency", true, nil, nil)

	commonEnergenieCases := merge(
		generateNumeric("retries", true, utils.ToPtr(1), nil),
		generateNumeric("delay", true, utils.ToPtr(1), nil),
	)

	commonZigBeeCases := merge(
		generateString("ieee", false, false, "a", "00:11:22:33:44:55:66", "00:11:22:33:44:55:66:77:88", "00:11:22:33:44:55:66:GG"),
		generateString("nwk", false, false, "a", "0xaaa", "0xaaaaa", "0xabcg"),
	)

	suites = append(
		suites,
		// Energenie
		schemaSuite{
			file:       "devices/energenie/EnergeniePairing.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("timeout", true, utils.ToPtr(1), nil),
			),
		},

		schemaSuite{
			file:       "devices/energenie/EnergenieSocket.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonEnergenieCases,
				generateNumeric("device_id", true, utils.ToPtr(0), utils.ToPtr(4)),
			),
		},

		schemaSuite{
			file:       "devices/energenie/EnergenieSocketGroup.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonEnergenieCases,
				generateNumeric("home_id", false, utils.ToPtr(0), utils.ToPtr(15)),
				generateArray("devices", false, false, "1"),
			),
		},

		// Energy Monitor
		schemaSuite{
			file:       "devices/energy-monitor/OctopusElectricityMeter.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("electricity"),
				generateString("serial_number", false, true),
				generateString("mpan", false, false, "123456789012", "12345678901234"),
			),
		},

		schemaSuite{
			file:       "devices/energy-monitor/OctopusGasMeter.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("gas"),
				generateString("serial_number", false, true),
				generateString("mprn", false, false, "12345", "12345678901"),
				generateEnum("generation", false, false, utils.ToPtr("SMETS0"), "SMETS1", "SMETS2"),
			),
		},

		// Harmony
		schemaSuite{
			file:       "devices/harmony/HarmonyActivity.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateString("hub", false, false),
				generateString("activity_name", true, true),
			),
		},

		schemaSuite{
			file:       "devices/harmony/HarmonyHub.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateHostAddress(),
			),
		},

		// LIFX
		schemaSuite{
			file:       "devices/lifx/LIFXLight.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateMAC("mac", false, false),
				generateHostAddress(),
				generateNumeric("duration", true, utils.ToPtr(0), nil),
			),
		},

		// Network
		schemaSuite{
			file:       "devices/network/Computer.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateMAC("mac", false, false),
				generateHostAddress(),
				generateNumeric("delay", true, utils.ToPtr(1), utils.ToPtr(60)),
			),
		},
		schemaSuite{
			file:       "devices/network/NetworkPresence.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonAbstractDeviceCases,
				commonPollableCases,
				generateMAC("mac", false, false),
				generateHostAddress(),
				generateNumeric("absent_delay", true, utils.ToPtr(1), utils.ToPtr(60*60)),
			),
		},

		// Snapcast
		schemaSuite{
			file:       "devices/snapcast/SnapcastClient.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateString("server", false, false),
				generateMAC("mac", false, false),
				[]schemaCase{
					{"valid host_id", []schemaPatch{
						{"host_id", "add", utils.ToPtr(`"client.home"`)},
						{"mac", "remove", nil},
					}, true},
					{"missing mac and host_id", []schemaPatch{{"mac", "remove", nil}}, false},
				},
			),
		},

		schemaSuite{
			file:       "devices/snapcast/SnapcastServer.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateHostAddress(),
				generateNumeric("port", true, utils.ToPtr(1), utils.ToPtr(65535)),
			),
		},

		// PowerPi
		schemaSuite{
			file:       "devices/PowerPiSensor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				generateMetrics("humidity", "motion", "temperature"),

				generateNumeric("poll_delay", true, utils.ToPtr(1), nil),

				generateObject("dht22", true, true),
				generateNumeric("dht22/skip", true, utils.ToPtr(1), nil),

				generateObject("pir", true, true),
				generateNumeric("pir/init_delay", true, utils.ToPtr(1), nil),
				generateNumeric("pir/post_detect_skip", true, utils.ToPtr(1), nil),
				generateNumeric("pir/post_motion_check", true, utils.ToPtr(1), nil),
			),
		},

		// Virtual
		schemaSuite{
			file:       "devices/virtual/Condition.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateString("device", false, false),
				generateObject("on_condition", true, false),
				generateObject("off_condition", true, false),
				[]schemaCase{
					{"missing on_condition and off_condition", []schemaPatch{
						{"on_condition", "remove", nil},
						{"off_condition", "remove", nil},
					}, false},
				},
				generateNumeric("timeout", true, utils.ToPtr(1), nil),
				generateNumeric("interval", true, utils.ToPtr(1), nil),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Delay.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("start", true, utils.ToPtr(0), nil),
				generateNumeric("end", true, utils.ToPtr(0), nil),
				[]schemaCase{
					{"missing start and end", []schemaPatch{
						{"start", "remove", nil},
						{"end", "remove", nil},
					}, false},
				},
			),
		},

		schemaSuite{
			file:       "devices/virtual/Geofence.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonAbstractDeviceCases,
				generateObject("condition", false, false),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Group.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateArray("devices", false, false, "1"),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Log.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateString("message", false, true),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Mutex.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateArray("on_devices", false, false, "1"),
				generateArray("off_devices", false, false, "1"),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Scene.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonPollableCases,
				generateArray("devices", false, false, "1"),
				generateString("scene", true, false, "123scene"),
				generateObject("state", false, false),
				generateNumeric("state/brightness", true, utils.ToPtr(0), utils.ToPtr(100)),
				generateNumeric("state/temperature", true, utils.ToPtr(1500), utils.ToPtr(10000)),
				generateNumeric("state/hue", true, utils.ToPtr(0), utils.ToPtr(360)),
				generateNumeric("state/saturation", true, utils.ToPtr(0), utils.ToPtr(100)),
			),
		},

		schemaSuite{
			file:       "devices/virtual/Variable.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases:      commonDeviceCases,
		},

		// ZigBee
		schemaSuite{
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

		schemaSuite{
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

		schemaSuite{
			file:       "devices/zigbee/IkeaStyrbar.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		schemaSuite{
			file:       "devices/zigbee/OsramSwitchMini.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		schemaSuite{
			file:       "devices/zigbee/SonoffSwitch.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
			),
		},

		schemaSuite{
			file:       "devices/zigbee/ZigBeeEnergyMonitor.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       sensorPath,
			cases: merge(
				commonSensorCases,
				commonZigBeeCases,
				commonPollableCases,
				generateMetrics("power", "current", "voltage"),
			),
		},

		schemaSuite{
			file:       "devices/zigbee/ZigBeeLight.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				commonZigBeeCases,
				commonPollableCases,
				generateNumeric("duration", true, utils.ToPtr(0), nil),
			),
		},

		schemaSuite{
			file:       "devices/zigbee/ZigBeePairing.json",
			configType: models.ConfigTypeDevices,
			wrapper:    devicesWrapper,
			path:       devicePath,
			cases: merge(
				commonDeviceCases,
				generateNumeric("timeout", true, utils.ToPtr(1), nil),
			),
		},

		schemaSuite{
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

func generateMetrics(keys ...string) []schemaCase {
	cases := generateObject("metrics", false, false)

	for _, key := range keys {
		cases = merge(
			cases,
			generateEnum(fmt.Sprintf("metrics/%s", key), len(keys) > 1, false, utils.ToPtr("test"), "none", "read", "visible"),
		)
	}

	return cases
}

package schema

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
)

type schedulesWrapper struct {
	Timezone  string            `json:"timezone"`
	Schedules []json.RawMessage `json:"schedules"`
}

func init() {
	wrapper := schedulesWrapper{
		Timezone:  "Europe/London",
		Schedules: []json.RawMessage{},
	}

	commonScheduleCases := merge(
		generateString("schedule", false, false, "* * * *", "A * * * *", "* * * * * *"),
		[]schemaCase{
			{"valid cron wildcard", []schemaPatch{{"schedule", "replace", utils.ToPtr(`"* * * * *"`)}}, true},
			{"valid cron step", []schemaPatch{{"schedule", "replace", utils.ToPtr(`"*/2 * * * *"`)}}, true},
			{"valid cron range", []schemaPatch{{"schedule", "replace", utils.ToPtr(`"* * * * 1-5"`)}}, true},
			{"valid cron list", []schemaPatch{{"schedule", "replace", utils.ToPtr(`"* * * * 5,7"`)}}, true},
		},

		generateString("device", false, false),
		[]schemaCase{
			{"valid devices", []schemaPatch{
				{"devices", "add", utils.ToPtr(`["BedroomLight", "HallwayLight"]`)},
				{"device", "remove", nil},
			}, true},
			{"invalid devices items", []schemaPatch{
				{"devices", "add", utils.ToPtr(`[1]`)},
				{"device", "remove", nil},
			}, false},
			{"invalid devices empty", []schemaPatch{
				{"devices", "add", utils.ToPtr(`[]`)},
				{"device", "remove", nil},
			}, false},
			{"invalid both device and devices", []schemaPatch{
				{"devices", "add", utils.ToPtr(`["BedroomLight"]`)},
			}, false},
		},

		generateBoolean("power", true),
		generateObject("condition", true, false),
		generateString("scene", true, false, "123scene"),
		[]schemaCase{
			{"additional property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
		},
	)

	suites = append(
		suites,
		schemaSuite{
			file:       "schedules/Schedules.json",
			configType: models.ConfigTypeSchedules,
			wrapper:    struct{}{},
			path:       "",
			cases: merge(
				generateString("timezone", false, true),
				generateArray("schedules", false, true, `"str"`),
				[]schemaCase{
					{"additional property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},

		schemaSuite{
			file:       "schedules/DeviceIntervalSchedule.json",
			configType: models.ConfigTypeSchedules,
			wrapper:    wrapper,
			path:       "/schedules/0",
			cases: merge(
				commonScheduleCases,
				generateNumeric("duration", false, utils.ToPtr(0), nil),
				generateNumeric("interval", false, utils.ToPtr(0), nil),
				generateBoolean("force", true),
				generateTuple("brightness", true, 0, 2, utils.ToPtr(2), `"str"`),
				generateNumeric("brightness/0", false, utils.ToPtr(float64(0)), utils.ToPtr(float64(100))),
				generateTuple("temperature", true, 0, 2, utils.ToPtr(2), `"str"`),
				generateNumeric("temperature/0", false, utils.ToPtr(1500), utils.ToPtr(10000)),
				generateTuple("hue", true, 0, 2, utils.ToPtr(2), `"str"`),
				generateNumeric("hue/0", false, utils.ToPtr(0), utils.ToPtr(360)),
				generateTuple("saturation", true, 0, 2, utils.ToPtr(2), `"str"`),
				generateNumeric("saturation/0", false, utils.ToPtr(float64(0)), utils.ToPtr(float64(100))),
			),
		},

		schemaSuite{
			file:       "schedules/DeviceSingleSchedule.json",
			configType: models.ConfigTypeSchedules,
			wrapper:    wrapper,
			path:       "/schedules/0",
			cases: merge(
				commonScheduleCases,
				generateNumeric("brightness", true, utils.ToPtr(float64(0)), utils.ToPtr(float64(100))),
				generateNumeric("temperature", true, utils.ToPtr(1500), utils.ToPtr(10000)),
				generateNumeric("hue", true, utils.ToPtr(0), utils.ToPtr(360)),
				generateNumeric("saturation", true, utils.ToPtr(float64(0)), utils.ToPtr(float64(100))),
			),
		},
	)
}

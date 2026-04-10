package schema

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
)

type eventsWrapper struct {
	Listeners []json.RawMessage `json:"listeners"`
}

type eventListenerWrapper struct {
	Listeners []eventListener `json:"listeners"`
}

type eventListener struct {
	Topic  string            `json:"topic"`
	Events []json.RawMessage `json:"events"`
}

func init() {
	listenerWrapper := eventsWrapper{
		Listeners: []json.RawMessage{},
	}

	eventWrapper := eventListenerWrapper{
		Listeners: []eventListener{
			{Topic: "Office/motion", Events: []json.RawMessage{}},
		},
	}

	suites = append(
		suites,
		// Listener
		schemaSuite{
			file:       "events/Listener.json",
			configType: models.ConfigTypeEvents,
			wrapper:    listenerWrapper,
			path:       "/listeners/0",
			cases: merge(
				generateString("topic", false, false, "noslash", "Office/motion/extra"),
				generateArray("events", false, false, "1"),
				[]schemaCase{
					{"additional listener property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},

		// Event
		schemaSuite{
			file:       "events/Event.json",
			configType: models.ConfigTypeEvents,
			wrapper:    eventWrapper,
			path:       "/listeners/0/events/0",
			cases: merge(
				generateObject("action", false, false),
				generateObject("condition", false, false),
				[]schemaCase{
					{"additional event property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},

				// action
				generateString("action/device", false, false, "123device"),
				generateEnum("action/state", false, false, utils.ToPtr("maybe"), "on", "off"),
				[]schemaCase{
					{"missing action state scene and patch", []schemaPatch{{"action/state", "remove", nil}}, false},
					{"valid action scene", []schemaPatch{
						{"action/scene", "add", utils.ToPtr(`"movie"`)},
						{"action/state", "remove", nil},
					}, true},
					{"invalid action scene", []schemaPatch{
						{"action/scene", "add", utils.ToPtr(`"123scene"`)},
						{"action/state", "remove", nil},
					}, false},
					{"valid action patch", []schemaPatch{
						{"action/patch", "add", utils.ToPtr(`[{"op": "replace", "path": "/brightness", "value": "+5000"}]`)},
						{"action/state", "remove", nil},
					}, true},
					{"invalid action patch empty", []schemaPatch{
						{"action/patch", "add", utils.ToPtr(`[]`)},
						{"action/state", "remove", nil},
					}, false},
					{"invalid action patch missing op", []schemaPatch{
						{"action/patch", "add", utils.ToPtr(`[{"path": "/brightness", "value": "+5000"}]`)},
						{"action/state", "remove", nil},
					}, false},
					{"invalid action patch invalid op", []schemaPatch{
						{"action/patch", "add", utils.ToPtr(`[{"op": "invalid", "path": "/brightness", "value": "+5000"}]`)},
						{"action/state", "remove", nil},
					}, false},
					{"additional action property", []schemaPatch{{"action/prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},
	)
}

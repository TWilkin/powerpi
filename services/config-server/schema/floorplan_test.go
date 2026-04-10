package schema

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
)

type floorplanOuterWrapper struct {
	Floorplan floorplanWrapper `json:"floorplan"`
}

type floorplanWrapper struct {
	Floors []json.RawMessage `json:"floors"`
}

type floorWrapper struct {
	Floorplan floorplanFloorWrapper `json:"floorplan"`
}

type floorplanFloorWrapper struct {
	Floors []floorEntry `json:"floors"`
}

type floorEntry struct {
	Name  string            `json:"name"`
	Rooms []json.RawMessage `json:"rooms"`
}

func init() {
	topWrapper := struct{}{}

	floorListWrapper := floorplanOuterWrapper{
		Floorplan: floorplanWrapper{
			Floors: []json.RawMessage{},
		},
	}

	roomWrapper := floorWrapper{
		Floorplan: floorplanFloorWrapper{
			Floors: []floorEntry{
				{Name: "Ground", Rooms: []json.RawMessage{}},
			},
		},
	}

	suites = append(
		suites,
		// Top level
		schemaSuite{
			file:       "floorplan/Floorplan.json",
			configType: models.ConfigTypeFloorplan,
			wrapper:    topWrapper,
			path:       "",
			cases: merge(
				generateObject("floorplan", false, true),
				generateArray("floorplan/floors", true, false, "1"),
				[]schemaCase{
					{"additional property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},

		// Floor
		schemaSuite{
			file:       "floorplan/Floor.json",
			configType: models.ConfigTypeFloorplan,
			wrapper:    floorListWrapper,
			path:       "/floorplan/floors/0",
			cases: merge(
				generateString("name", false, false, "123floor"),
				generateString("display_name", true, true),
				generateArray("rooms", false, false, "1"),
				[]schemaCase{
					{"additional floor property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},

		// Room with width/height
		schemaSuite{
			file:       "floorplan/RoomRect.json",
			configType: models.ConfigTypeFloorplan,
			wrapper:    roomWrapper,
			path:       "/floorplan/floors/0/rooms/0",
			cases: merge(
				generateString("name", false, false, "123room"),
				generateString("display_name", true, true),
				generateNumeric[int]("x", true, nil, nil),
				generateNumeric[int]("y", true, nil, nil),
				generateNumeric[int]("width", true, nil, nil),
				generateNumeric[int]("height", true, nil, nil),
				[]schemaCase{
					{"missing dimensions", []schemaPatch{
						{"x", "remove", nil},
						{"y", "remove", nil},
						{"width", "remove", nil},
						{"height", "remove", nil},
					}, false},
					{"additional room property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},

		// Room with points
		schemaSuite{
			file:       "floorplan/RoomPoints.json",
			configType: models.ConfigTypeFloorplan,
			wrapper:    roomWrapper,
			path:       "/floorplan/floors/0/rooms/0",
			cases: merge(
				generateString("name", false, false, "123room"),
				generateString("display_name", true, true),
				generateTuple("points", false, 0, 3, 4, `"str"`),
				generateNumeric[int]("points/0/x", false, nil, nil),
				generateNumeric[int]("points/0/y", false, nil, nil),
				[]schemaCase{
					{"additional point property", []schemaPatch{{"points/0/prop", "add", utils.ToPtr(`"value"`)}}, false},
					{"additional room property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},
	)
}

package schema

import (
	"encoding/json"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
)

type usersWrapper struct {
	Users []json.RawMessage `json:"users"`
}

func init() {
	wrapper := usersWrapper{
		Users: []json.RawMessage{},
	}

	suites = append(
		suites,
		schemaSuite{
			file:       "users/User.json",
			configType: models.ConfigTypeUsers,
			wrapper:    wrapper,
			path:       "/users/0",
			cases: merge(
				generateString("email", false, false),
				generateEnum("role", false, false, utils.ToPtr("SUPERHERO"), "USER"),
				[]schemaCase{
					{"additional property", []schemaPatch{{"prop", "add", utils.ToPtr(`"value"`)}}, false},
				},
			),
		},
	)
}

package schema

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/config-server/services/validator"
	jsonpatch "gopkg.in/evanphx/json-patch.v4"
)

//go:embed testdata
var testdata embed.FS

type Suite struct {
	file       string
	configType models.ConfigType
	wrapper    any
	path       string
}

var suites []Suite

func Test(t *testing.T) {
	service := validator.NewValidatorService(Schema)

	for _, suite := range suites {
		t.Run(suite.file, func(t *testing.T) {
			// read the file
			data, err := testdata.ReadFile(fmt.Sprintf("testdata/%s", suite.file))
			if err != nil {
				t.Fatalf("%s", err.Error())
			}
			var buffer bytes.Buffer
			json.Compact(&buffer, data)

			// read the wrapper JSON
			base, err := json.Marshal(suite.wrapper)
			if err != nil {
				t.Fatalf("%s", err.Error())
			}

			// patch the test into the wrapper
			patch, err := jsonpatch.DecodePatch([]byte(
				fmt.Sprintf(`[{"op": "add", "path": "%s", "value": %s}]`, suite.path, buffer.String()),
			))
			if err != nil {
				t.Fatalf("%s", err.Error())
			}
			result, err := patch.Apply(base)
			if err != nil {
				t.Fatalf("%s", err.Error())
			}

			// first we run the positive test
			t.Run("positive", func(t *testing.T) {
				_, err := service.Validate(suite.configType, string(result))
				if err != nil {
					t.Errorf("Failed validation %s", err.Error())
				}
			})
		})
	}
}

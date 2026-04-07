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
			result := patch(t, base, suite.path, "add", buffer.String())

			// first we run the positive test
			t.Run("complete", func(t *testing.T) {
				validate(t, service, suite.configType, result, true)
			})
		})
	}
}

func validate(t *testing.T, service validator.ValidatorService, configType models.ConfigType, config []byte, expected bool) {
	_, err := service.Validate(configType, string(config))
	if expected && err != nil {
		t.Errorf("Failed validation %s", err.Error())
	}
	if !expected && err == nil {
		t.Errorf("Unexpectedly passed validation")
	}
}

func patch(t *testing.T, base []byte, path string, operand string, data string) []byte {
	patch, err := jsonpatch.DecodePatch(
		fmt.Appendf(nil, `[{"op": "%s", "path": "%s", "value": %s}]`, operand, path, data),
	)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	result, err := patch.Apply(base)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	return result
}

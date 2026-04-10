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

var suites []schemaSuite

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
			value := buffer.String()
			result := applyPatch(t, base, suite.path, schemaPatch{"", "add", &value})

			// first we run the complete test
			t.Run("complete", func(t *testing.T) {
				validate(t, service, suite.configType, result, true)
			})

			// then the cases
			for _, test := range suite.cases {
				t.Run(test.name, func(t *testing.T) {
					var testData = result
					for _, patch := range test.patches {
						fullPath := fmt.Sprintf("%s/%s", suite.path, patch.path)

						testData = applyPatch(t, testData, fullPath, patch)
					}

					validate(t, service, suite.configType, testData, test.expected)
				})
			}
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

func applyPatch(t *testing.T, base []byte, path string, patch schemaPatch) []byte {
	var patchJSON []byte
	if patch.value != nil {
		patchJSON = fmt.Appendf(nil, `[{"op": "%s", "path": "%s", "value": %s}]`, patch.operand, path, *patch.value)
	} else {
		patchJSON = fmt.Appendf(nil, `[{"op": "%s", "path": "%s"}]`, patch.operand, path)
	}

	patcher, err := jsonpatch.DecodePatch(patchJSON)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	result, err := patcher.Apply(base)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	return result
}

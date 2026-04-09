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
	cases      []Case
}

type Case struct {
	name     string
	path     string
	operand  string
	value    *string
	expected bool
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
			value := buffer.String()
			result := patch(t, base, suite.path, "add", &value)

			// first we run the complete test
			t.Run("complete", func(t *testing.T) {
				validate(t, service, suite.configType, result, true)
			})

			// then the cases
			for _, test := range suite.cases {
				t.Run(test.name, func(t *testing.T) {
					fullPath := fmt.Sprintf("%s/%s", suite.path, test.path)

					result := patch(t, result, fullPath, test.operand, test.value)

					validate(t, service, suite.configType, result, test.expected)
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

func patch(t *testing.T, base []byte, path string, operand string, value *string) []byte {
	var patchJSON []byte
	if value != nil {
		patchJSON = fmt.Appendf(nil, `[{"op": "%s", "path": "%s", "value": %s}]`, operand, path, *value)
	} else {
		patchJSON = fmt.Appendf(nil, `[{"op": "%s", "path": "%s"}]`, operand, path)
	}

	patch, err := jsonpatch.DecodePatch(patchJSON)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	result, err := patch.Apply(base)
	if err != nil {
		t.Fatalf("%s", err.Error())
	}

	return result
}

func strPtr(str string) *string {
	return &str
}

func intPtr(n int) *int {
	return &n
}

func floatPtr(n float64) *float64 {
	return &n
}

func merge(cases ...[]Case) []Case {
	var result []Case

	for _, test := range cases {
		result = append(result, test...)
	}

	return result
}

func generateMissing(path string, optional bool) []Case {
	return []Case{
		{fmt.Sprintf("missing %s", path), path, "remove", nil, optional},
	}
}

func generateNumeric[TNumber int | float64](path string, optional bool, min *TNumber, max *TNumber) []Case {
	cases := append(
		generateMissing(path, optional),
		Case{fmt.Sprintf("invalid %s", path), path, "replace", strPtr(`"str"`), false},
	)

	if min != nil {
		cases = append(
			cases,
			Case{fmt.Sprintf("valid %s min", path), path, "replace", strPtr(fmt.Sprintf("%v", *min)), true},
			Case{fmt.Sprintf("invalid %s min", path), path, "replace", strPtr(fmt.Sprintf("%v", *min-1)), false},
		)
	}

	if max != nil {
		cases = append(
			cases,
			Case{fmt.Sprintf("valid %s max", path), path, "replace", strPtr(fmt.Sprintf("%v", *max)), true},
			Case{fmt.Sprintf("invalid %s max", path), path, "replace", strPtr(fmt.Sprintf("%v", *max+1)), false},
		)
	}

	return cases
}

func generateBoolean(path string, optional bool) []Case {
	return append(
		generateMissing(path, optional),
		Case{fmt.Sprintf("invalid %s", path), path, "replace", strPtr(`"str"`), false},
		Case{fmt.Sprintf("invalid %s truthy", path), path, "replace", strPtr(`1`), false},
	)
}

func generateString(path string, optional bool, empty bool, invalid *string) []Case {
	cases := append(
		generateMissing(path, optional),
		Case{fmt.Sprintf("empty %s", path), path, "replace", strPtr(`""`), empty},

		Case{"invalid type", path, "replace", strPtr("12345"), false},
	)

	if invalid != nil {
		cases = append(
			cases,
			Case{fmt.Sprintf("invalid %s", path), path, "replace", strPtr(fmt.Sprintf(`"%s"`, *invalid)), false},
		)
	}

	return cases
}

func generateEnum(path string, optional bool, empty bool, invalid *string, valid ...string) []Case {
	cases := generateString(path, optional, empty, invalid)

	for _, value := range valid {
		cases = append(cases, Case{fmt.Sprintf("valid %s", path), path, "replace", strPtr(fmt.Sprintf(`"%s"`, value)), true})
	}

	return cases
}

func generateObject(path string, optional bool, empty bool) []Case {
	return append(
		generateMissing(path, optional),
		Case{fmt.Sprintf("empty %s", path), path, "replace", strPtr("{}"), empty}, // should this be allowed?
		Case{fmt.Sprintf("invalid %s", path), path, "replace", strPtr(`"str"`), false},
		Case{fmt.Sprintf("invalid %s prop", path), path, "replace", strPtr(`{"some": "prop"}`), false},
	)
}

func generateArray(path string, optional bool, empty bool, invalid string) []Case {
	return append(
		generateMissing(path, optional),
		Case{fmt.Sprintf("empty %s", path), path, "replace", strPtr("[]"), empty}, // should this be allowed?
		Case{fmt.Sprintf("invalid %s", path), path, "replace", strPtr(fmt.Sprintf(`[%s]`, invalid)), false},
	)
}

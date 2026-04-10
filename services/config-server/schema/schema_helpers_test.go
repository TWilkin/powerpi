package schema

import (
	"fmt"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/utils"
)

type schemaSuite struct {
	file       string
	configType models.ConfigType
	wrapper    any
	path       string
	cases      []schemaCase
}

type schemaCase struct {
	name     string
	patches  []schemaPatch
	expected bool
}

type schemaPatch struct {
	path    string
	operand string
	value   *string
}

func merge(cases ...[]schemaCase) []schemaCase {
	var result []schemaCase

	for _, test := range cases {
		result = append(result, test...)
	}

	return result
}

func generateMissing(path string, optional bool) []schemaCase {
	return []schemaCase{
		{fmt.Sprintf("missing %s", path), []schemaPatch{{path, "remove", nil}}, optional},
	}
}

func generateNumeric[TNumber int | float64](path string, optional bool, min *TNumber, max *TNumber) []schemaCase {
	cases := append(
		generateMissing(path, optional),
		schemaCase{fmt.Sprintf("invalid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(`"str"`)}}, false},
	)

	if min != nil {
		cases = append(
			cases,
			schemaCase{fmt.Sprintf("valid %s min", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf("%v", *min))}}, true},
			schemaCase{fmt.Sprintf("invalid %s min", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf("%v", *min-1))}}, false},
		)
	}

	if max != nil {
		cases = append(
			cases,
			schemaCase{fmt.Sprintf("valid %s max", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf("%v", *max))}}, true},
			schemaCase{fmt.Sprintf("invalid %s max", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf("%v", *max+1))}}, false},
		)
	}

	return cases
}

func generateBoolean(path string, optional bool) []schemaCase {
	return append(
		generateMissing(path, optional),
		schemaCase{fmt.Sprintf("invalid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(`"str"`)}}, false},
		schemaCase{fmt.Sprintf("invalid %s truthy", path), []schemaPatch{{path, "replace", utils.ToPtr(`1`)}}, false},
	)
}

func generateString(path string, optional bool, empty bool, invalid *string) []schemaCase {
	cases := append(
		generateMissing(path, optional),
		schemaCase{fmt.Sprintf("empty %s", path), []schemaPatch{{path, "replace", utils.ToPtr(`""`)}}, empty},
		schemaCase{"invalid type", []schemaPatch{{path, "replace", utils.ToPtr("12345")}}, false},
	)

	if invalid != nil {
		cases = append(
			cases,
			schemaCase{fmt.Sprintf("invalid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf(`"%s"`, *invalid))}}, false},
		)
	}

	return cases
}

func generateEnum(path string, optional bool, empty bool, invalid *string, valid ...string) []schemaCase {
	cases := generateString(path, optional, empty, invalid)

	for _, value := range valid {
		cases = append(cases, schemaCase{fmt.Sprintf("valid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf(`"%s"`, value))}}, true})
	}

	return cases
}

func generateObject(path string, optional bool, empty bool) []schemaCase {
	return append(
		generateMissing(path, optional),
		schemaCase{fmt.Sprintf("empty %s", path), []schemaPatch{{path, "replace", utils.ToPtr("{}")}}, empty},
		schemaCase{fmt.Sprintf("invalid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(`"str"`)}}, false},
		schemaCase{fmt.Sprintf("invalid %s prop", path), []schemaPatch{{path, "replace", utils.ToPtr(`{"some": "prop"}`)}}, false},
	)
}

func generateArray(path string, optional bool, empty bool, invalid string) []schemaCase {
	return append(
		generateMissing(path, optional),
		schemaCase{fmt.Sprintf("empty %s", path), []schemaPatch{{path, "replace", utils.ToPtr("[]")}}, empty},
		schemaCase{fmt.Sprintf("invalid %s", path), []schemaPatch{{path, "replace", utils.ToPtr(fmt.Sprintf(`[%s]`, invalid))}}, false},
	)
}

func generateIP(path string, optional bool, empty bool) []schemaCase {
	return append(
		generateString(path, optional, empty, utils.ToPtr("not-an-ip")),
		schemaCase{"invalid", []schemaPatch{{path, "replace", utils.ToPtr(`"A.1.2.3"`)}}, false},
		schemaCase{"invalid too big", []schemaPatch{{path, "replace", utils.ToPtr(`"256.1.2.3"`)}}, false},
	)
}

func generateHostAddress() []schemaCase {
	ipPath := "ip"
	hostnamePath := "hostname"

	return append(
		generateIP(ipPath, false, false),
		schemaCase{"valid hostname", []schemaPatch{
			{hostnamePath, "add", utils.ToPtr(`"mydevice.home"`)},
			{ipPath, "remove", nil},
		}, true},
		schemaCase{"missing ip and hostname", []schemaPatch{{ipPath, "remove", nil}}, false},
	)
}

func generateMAC(path string, optional bool, empty bool) []schemaCase {
	return append(
		generateString(path, optional, empty, utils.ToPtr("not-a-mac")),
		schemaCase{"invalid too big", []schemaPatch{{path, "replace", utils.ToPtr(`"GF:EE:CC:BB:AA:99"`)}}, false},
	)
}

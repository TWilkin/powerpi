package validator

import (
	"embed"
	"fmt"
	"io/fs"
	"strings"
	"sync"

	"github.com/TWilkin/powerpi/common/models"

	jsonSchema "github.com/santhosh-tekuri/jsonschema/v6"
)

type ValidatorService interface {
	Validate(file models.ConfigType, content string) (map[string]any, error)
}

type validatorService struct {
	schema   embed.FS
	compiler func() (*jsonSchema.Compiler, error)
}

func NewValidatorService(schema embed.FS) ValidatorService {
	service := &validatorService{
		schema: schema,
	}

	service.compiler = sync.OnceValues(service.initialiseCompiler)

	return service
}

func (validator *validatorService) initialiseCompiler() (*jsonSchema.Compiler, error) {
	compiler := jsonSchema.NewCompiler()

	err := fs.WalkDir(
		validator.schema,
		".",
		func(path string, directory fs.DirEntry, err error) error {
			return validator.addSchemaDirectory(compiler, path, directory, err)
		},
	)

	return compiler, err
}

func (validator *validatorService) addSchemaDirectory(compiler *jsonSchema.Compiler, path string, directory fs.DirEntry, err error) error {
	if err != nil || directory.IsDir() {
		return err
	}

	file, err := validator.schema.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	schema, err := jsonSchema.UnmarshalJSON(file)
	if err != nil {
		return err
	}

	schemaJson, ok := schema.(map[string]any)
	if ok {
		id, ok := schemaJson["$id"].(string)
		if ok {
			return compiler.AddResource(id, schema)
		}

		return fmt.Errorf("Schema %s is missing $id", path)
	}

	return fmt.Errorf("Schema %s is missing $id", path)
}

func (validator *validatorService) Validate(file models.ConfigType, content string) (map[string]any, error) {
	compiler, err := validator.compiler()
	if err != nil {
		return nil, err
	}

	schemaName := fmt.Sprintf(
		"https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/schema/config/%s.schema.json",
		file,
	)

	schema, err := compiler.Compile(schemaName)
	if err != nil {
		return nil, err
	}

	configFile, err := jsonSchema.UnmarshalJSON(strings.NewReader(content))
	if err != nil {
		return nil, err
	}

	json, ok := configFile.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("Expected JSON object")
	}

	return json, schema.Validate(json)

}

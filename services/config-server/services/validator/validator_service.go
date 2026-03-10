package validator

import (
	"embed"
	"fmt"
	"io/fs"
	"powerpi/config-server/models"
	"strings"
	"sync"

	jsonSchema "github.com/santhosh-tekuri/jsonschema/v6"
)

type ValidatorService interface {
	Validate(file models.FileType, content string) error
}

type validatorService struct {
	schema embed.FS

	compiler     *jsonSchema.Compiler
	compilerOnce sync.Once
}

func NewValidatorService(schema embed.FS) ValidatorService {
	return &validatorService{
		schema: schema,
	}
}

func (validator *validatorService) getCompiler() (*jsonSchema.Compiler, error) {
	var outerErr error

	validator.compilerOnce.Do(func() {
		validator.compiler = jsonSchema.NewCompiler()

		err := fs.WalkDir(validator.schema, ".", validator.addSchemaDirectory)
		if err != nil {
			outerErr = err
		}
	})

	return validator.compiler, outerErr
}

func (validator *validatorService) addSchemaDirectory(path string, directory fs.DirEntry, err error) error {
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
			return validator.compiler.AddResource(id, schema)
		}

		return fmt.Errorf("Schema %s is missing $id", path)
	}

	return fmt.Errorf("Schema %s is missing $id", path)
}

func (validator *validatorService) Validate(file models.FileType, content string) error {
	compiler, err := validator.getCompiler()
	if err != nil {
		return err
	}

	schemaName := fmt.Sprintf(
		"https://raw.githubusercontent.com/TWilkin/powerpi/main/services/config-server/schema/config/%s.schema.json",
		file,
	)

	schema, err := compiler.Compile(schemaName)
	if err != nil {
		return err
	}

	configFile, err := jsonSchema.UnmarshalJSON(strings.NewReader(content))
	if err != nil {
		return err
	}

	return schema.Validate(configFile)
}

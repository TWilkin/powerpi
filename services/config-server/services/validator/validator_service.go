package validator

import (
	"embed"
	"fmt"
	"strings"
	"sync"

	jsonSchema "github.com/santhosh-tekuri/jsonschema/v6"
)

type ValidatorService interface {
	Validate(file string, content string) error
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

		entries, err := validator.schema.ReadDir(".")
		if err != nil {
			outerErr = err
			return
		}

		// add the whole schema
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}

			file, err := validator.schema.Open(entry.Name())
			if err != nil {
				outerErr = err
				return
			}
			defer file.Close()

			schema, err := jsonSchema.UnmarshalJSON(file)
			if err != nil {
				outerErr = err
				return
			}

			err = validator.compiler.AddResource(entry.Name(), schema)
			if err != nil {
				outerErr = err
				return
			}
		}
	})

	return validator.compiler, outerErr
}

func (validator *validatorService) Validate(file string, content string) error {
	schemaName := fmt.Sprintf("config/%s.schema.json", file)

	schema, err := validator.compiler.Compile(schemaName)
	if err != nil {
		return err
	}

	configFile, err := jsonSchema.UnmarshalJSON(strings.NewReader(content))
	if err != nil {
		return err
	}

	return schema.Validate(configFile)
}

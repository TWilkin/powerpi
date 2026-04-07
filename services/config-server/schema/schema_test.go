package schema

import (
	"embed"
	"fmt"
	"testing"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/config-server/services/validator"
)

//go:embed testdata
var testdata embed.FS

type Suite struct {
	file       string
	configType models.ConfigType
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

			content := string(data)

			// first we run the positive test
			t.Run("positive", func(t *testing.T) {
				_, err := service.Validate(suite.configType, content)
				if err != nil {
					t.Errorf("Failed validation %s", err.Error())
				}
			})
		})
	}
}

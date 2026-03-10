package converter

import "sigs.k8s.io/yaml"

type ConverterService interface {
	YAMLtoJSON(content string) (string, error)
}

type converterService struct{}

func NewConverterService() ConverterService {
	return &converterService{}
}

func (converter *converterService) YAMLtoJSON(content string) (string, error) {
	json, err := yaml.YAMLToJSON([]byte(content))
	if err != nil {
		return "", err
	}

	return string(json), nil
}

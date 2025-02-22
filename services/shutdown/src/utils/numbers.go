package utils

type Number interface {
	int | float64
}

func NilOrEqual[TValueType Number](value1 *TValueType, value2 *TValueType) bool {
	return (value1 == nil && value2 == nil) || (value1 != nil && value2 != nil && *value1 == *value2)
}

func ToPtr[TValueType interface{}](value TValueType) *TValueType {
	return &value
}

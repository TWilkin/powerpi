package utils

func ToPtr[TValueType interface{}](value TValueType) *TValueType {
	return &value
}

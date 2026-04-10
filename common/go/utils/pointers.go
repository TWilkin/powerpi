package utils

func ToPtr[TValueType any](value TValueType) *TValueType {
	return &value
}

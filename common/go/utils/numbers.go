package utils

type number interface {
	int | float64
}

func NilOrEqual[TNumberType number](value1 *TNumberType, value2 *TNumberType) bool {
	return (value1 == nil && value2 == nil) || (value1 != nil && value2 != nil && *value1 == *value2)
}

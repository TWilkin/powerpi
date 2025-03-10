package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNilOrEqual(t *testing.T) {
	var tests = []struct {
		name     string
		value1   *int
		value2   *int
		expected bool
	}{
		{"both nil", nil, nil, true},
		{"first nil", nil, ToPtr(1), false},
		{"second nil", ToPtr(1), nil, false},
		{"both equal", ToPtr(1), ToPtr(1), true},
		{"both different", ToPtr(1), ToPtr(2), false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := NilOrEqual(test.value1, test.value2)

			assert.Equal(t, result, test.expected)
		})
	}
}

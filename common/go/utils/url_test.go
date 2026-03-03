package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateURL(t *testing.T) {
	var tests = []struct {
		name     string
		baseURL  string
		paths    []string
		params   map[string]string
		expected string
		hasError bool
	}{
		{
			name:     "basic URL no paths or params",
			baseURL:  "https://example.com",
			paths:    []string{},
			params:   map[string]string{},
			expected: "https://example.com",
			hasError: false,
		},
		{
			name:     "URL with paths no params",
			baseURL:  "https://example.com",
			paths:    []string{"api", "v1", "users"},
			params:   map[string]string{},
			expected: "https://example.com/api/v1/users",
			hasError: false,
		},
		{
			name:     "URL with params no paths",
			baseURL:  "https://example.com",
			paths:    []string{},
			params:   map[string]string{"page": "1", "limit": "10"},
			expected: "https://example.com?limit=10&page=1",
			hasError: false,
		},
		{
			name:     "URL with paths and params",
			baseURL:  "https://example.com",
			paths:    []string{"api", "v1", "users"},
			params:   map[string]string{"page": "1", "limit": "10"},
			expected: "https://example.com/api/v1/users?limit=10&page=1",
			hasError: false,
		},
		{
			name:     "URL with base path",
			baseURL:  "https://example.com/base",
			paths:    []string{"api", "v1", "users"},
			params:   map[string]string{},
			expected: "https://example.com/base/api/v1/users",
			hasError: false,
		},
		{
			name:     "URL with trailing slash",
			baseURL:  "https://example.com/",
			paths:    []string{"api", "v1", "users"},
			params:   map[string]string{},
			expected: "https://example.com/api/v1/users",
			hasError: false,
		},
		{
			name:     "invalid URL",
			baseURL:  "://invalid-url",
			paths:    []string{},
			params:   map[string]string{},
			expected: "",
			hasError: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := GenerateURL(test.baseURL, test.paths, test.params)

			if test.hasError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, test.expected, result)
			}
		})
	}
}

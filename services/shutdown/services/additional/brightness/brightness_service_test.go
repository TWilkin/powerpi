package brightness

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"powerpi/shutdown/services/flags"
)

func TestGetBrightness(t *testing.T) {
	var tests = []struct {
		name       string
		brightness string
		min        float64
		max        float64
		expected   int
	}{
		{"0 == 0", "0", 0.0, 100.0, 0},
		{"50 == 50", "50", 0.0, 100.0, 50},
		{"100 == 100", "100", 0.0, 100.0, 100},
		{"60 == 50", "60", 10.0, 110.0, 50},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			dir := t.TempDir()
			file := dir + "/brightness"

			os.WriteFile(file, []byte(test.brightness), 0777)

			config := flags.BrightnessConfig{Device: file, Min: test.min, Max: test.max}

			result := NewBrightnessService(config).GetBrightness()

			assert.Equal(t, result, test.expected)
		})
	}
}

func TestSetBrightness(t *testing.T) {
	var tests = []struct {
		name       string
		brightness int
		min        float64
		max        float64
		expected   string
	}{
		{"0 == 0", 0, 0.0, 100.0, "0\n"},
		{"50 == 50", 50, 0.0, 100.0, "50\n"},
		{"100 == 100", 100, 0.0, 100.0, "100\n"},
		{"50 == 60", 50, 10.0, 110.0, "60\n"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			dir := t.TempDir()
			file := dir + "/brightness"

			config := flags.BrightnessConfig{Device: file, Min: test.min, Max: test.max}

			NewBrightnessService(config).SetBrightness(test.brightness)
			result, _ := os.ReadFile(file)

			assert.Equal(t, string(result), test.expected)
		})
	}
}

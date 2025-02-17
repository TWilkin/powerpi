package brightness

import (
	"testing"
	"testing/fstest"

	"powerpi/shutdown/flags"
)

func TestGetBrightness(t *testing.T) {
	var tests = []struct {
		name string
		brightness string
		min float64
		max float64
		expected int
	} {
		{"0 == 0", "0", 0.0, 100.0, 0},
		{"50 == 50", "50", 0.0, 100.0, 50},
		{"100 == 100", "100", 0.0, 100.0, 100},
		{"60 == 50", "60", 10.0, 110.0, 50},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			fs := fstest.MapFS{
				"brightness": {Data: []byte(test.brightness)},
			}
		
			config := flags.BrightnessConfig{"brightness", test.min, test.max}
		
			result := GetBrightness(fs, config)
		
			if result != test.expected {
				t.Errorf("Brightness incorrect, got: %d, expected: %d", result, test.expected)
			}
		})
	}
}

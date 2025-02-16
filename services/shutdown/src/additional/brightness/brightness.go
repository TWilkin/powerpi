package brightness

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

const PiTouchDisplay2 = "pi-touch-display-2"


func GetBrightness(device string) int {
	brightnessFile := getBrightnessFile(device)
	brightnessRange := getBrightnessRange(device)
	if brightnessFile == "" || brightnessRange.min == -1 || brightnessRange.max == -1 {
		fmt.Printf("Unrecognised brightness device %s\n", device)
		return -1
	}

	data, err := os.ReadFile(brightnessFile)
	if err != nil {
		panic(err)
	}

	str := string(data)
	str = strings.TrimSuffix(str, "\n")
	value, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}

	brightness := int((float64(value) - brightnessRange.min) / brightnessRange.max * 100.0)
	fmt.Printf("Read brightness %d (%d%%)\n", value, brightness)
	return brightness
}

func SetBrightness(device string, value int) {
	brightnessFile := getBrightnessFile(device)
	brightnessRange := getBrightnessRange(device)
	if brightnessFile == "" || brightnessRange.min == -1 || brightnessRange.max == -1 {
		fmt.Printf("Unrecognised brightness device %s\n", device)
		return
	}

	brightness := int(((float64(value) / 100.0) * brightnessRange.max) + brightnessRange.min)
	fmt.Printf("Wrote brightness %d (%d%%)\n", brightness, value)

	data := fmt.Sprintf("%d\n", brightness)
	err := os.WriteFile(brightnessFile, []byte(data), 0777)
	if err != nil {
		panic(err)
	}
}

func getBrightnessFile(device string) string {
	switch device {
		case PiTouchDisplay2:
			return "/sys/class/backlight/10-0045/brightness"

		default:
			return ""
	}
}

func getBrightnessRange(device string) struct {min float64; max float64} {
	switch device {
		case PiTouchDisplay2:
			return struct {min float64; max float64} { 0, 31 }

		default:
			return struct {min float64; max float64} { -1, -1 }
	}
}

package brightness

import (
	"fmt"
	"os"
	"strconv"
)

type BrightnessDevice string
const (
	PiTouchDisplay2 BrightnessDevice = "pi-touch-display-2"
)

func GetBrightness(device BrightnessDevice) int {
	brightnessFile := getBrightnessFile(device)
	brightnessRange := getBrightnessRange(device)
	if brightnessFile == "" || brightnessRange.min == -1 || brightnessRange.max == -1 {
		fmt.Printf("Unrecognised brightness device %s", device)
		return -1
	}

	data, err := os.ReadFile(brightnessFile)
	if err != nil {
		panic(err)
	}

	value, err := strconv.Atoi(string(data))
	if err != nil {
		panic(err)
	}

	brightness := (value - brightnessRange.min) / brightnessRange.max * 100
	return brightness
}

func SetBrightness(device BrightnessDevice, brightness int) {
	brightnessFile := getBrightnessFile(device)
	brightnessRange := getBrightnessRange(device)
	if brightnessFile == "" || brightnessRange.min == -1 || brightnessRange.max == -1 {
		fmt.Printf("Unrecognised brightness device %s", device)
		return
	}

	err := os.WriteFile(brightnessFile, []byte(string(brightness)), 0777)
	if err != nil {
		panic(err)
	}
}

func getBrightnessFile(device BrightnessDevice) string {
	switch device {
		case PiTouchDisplay2:
			return "/sys/class/backlight/10-0045"

		default:
			return ""
	}
}

func getBrightnessRange(device BrightnessDevice) struct {min int; max int} {
	switch device {
		case PiTouchDisplay2:
			return struct {min int; max int} { 0, 31 }

		default:
			return struct {min int; max int} { -1, -1 }
	}
}

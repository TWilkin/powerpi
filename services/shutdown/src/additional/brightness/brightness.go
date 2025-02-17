package brightness

import (
	"fmt"
	"io/fs"
	"os"
	"strconv"
	"strings"

	"powerpi/shutdown/flags"
)

func GetBrightness(filesystem fs.FS, config flags.BrightnessConfig) int {
	data, err := fs.ReadFile(filesystem, config.Device)
	if err != nil {
		panic(err)
	}

	str := string(data)
	str = strings.TrimSuffix(str, "\n")
	value, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}

	brightness := int((float64(value) - config.Min) / config.Max * 100.0)
	fmt.Printf("Read brightness %d (%d%%)\n", value, brightness)
	return brightness
}

func SetBrightness(config flags.BrightnessConfig, value int) {
	brightness := int(((float64(value) / 100.0) * config.Max) + config.Min)
	fmt.Printf("Wrote brightness %d (%d%%)\n", brightness, value)

	data := fmt.Sprintf("%d\n", brightness)
	err := os.WriteFile(config.Device, []byte(data), 0777)
	if err != nil {
		panic(err)
	}
}

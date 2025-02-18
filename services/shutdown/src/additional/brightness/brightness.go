package brightness

import (
	"fmt"
	"io/fs"
	"os"
	"strconv"
	"strings"

	"powerpi/shutdown/flags"
)

type IBrightnessService interface {
	GetBrightness() int

	SetBrightness(value int)
}

type BrightnessService struct {
	config     flags.BrightnessConfig
	filesystem fs.FS
}

func New(config flags.BrightnessConfig, filesystem fs.FS) BrightnessService {
	return BrightnessService{config, filesystem}
}

func (service BrightnessService) GetBrightness() int {
	data, err := fs.ReadFile(service.filesystem, service.config.Device)
	if err != nil {
		panic(err)
	}

	str := string(data)
	str = strings.TrimSuffix(str, "\n")
	value, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}

	brightness := int((float64(value) - service.config.Min) / (service.config.Max - service.config.Min) * 100.0)
	fmt.Printf("Read brightness %d (%d%%)\n", value, brightness)
	return brightness
}

func (service BrightnessService) SetBrightness(value int) {
	brightness := int(((float64(value) / 100.0) * (service.config.Max - service.config.Min)) + service.config.Min)
	fmt.Printf("Wrote brightness %d (%d%%)\n", brightness, value)

	data := fmt.Sprintf("%d\n", brightness)
	err := os.WriteFile(service.config.Device, []byte(data), 0777)
	if err != nil {
		panic(err)
	}
}

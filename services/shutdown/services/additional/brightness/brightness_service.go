package brightness

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"powerpi/shutdown/config"
	configService "powerpi/shutdown/services/config"
)

type BrightnessService interface {
	GetBrightness() int

	SetBrightness(value int)
}

type brightnessService struct {
	config config.BrightnessConfig
}

func NewBrightnessService(configService configService.ConfigService) BrightnessService {
	return brightnessService{configService.Config().AdditionalState.Brightness}
}

func (service brightnessService) GetBrightness() int {
	data, err := os.ReadFile(service.config.Device)
	if err != nil {
		panic(err)
	}

	str := string(data)
	str = strings.TrimSuffix(str, "\n")
	value, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}

	brightness := int((float64(value) - service.config.Min) /
		(service.config.Max - service.config.Min) * 100.0)
	fmt.Printf("Read brightness %d (%d%%)\n", value, brightness)
	return brightness
}

func (service brightnessService) SetBrightness(value int) {
	brightness := int(((float64(value) / 100.0) * (service.config.Max - service.config.Min)) +
		service.config.Min)
	fmt.Printf("Wrote brightness %d (%d%%)\n", brightness, value)

	data := fmt.Sprintf("%d\n", brightness)
	err := os.WriteFile(service.config.Device, []byte(data), 0777)
	if err != nil {
		panic(err)
	}
}

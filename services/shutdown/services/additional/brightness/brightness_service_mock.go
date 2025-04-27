package brightness

type MockBrightnessService struct {
	Brightness int
}

func (service MockBrightnessService) GetBrightness() int {
	return service.Brightness
}

func (service *MockBrightnessService) SetBrightness(value int) {
	service.Brightness = value
}

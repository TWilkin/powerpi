package additional_test

import (
	"powerpi/shutdown/services/additional"

	"github.com/stretchr/testify/mock"
)

type MockAdditionalStateService struct {
	mock.Mock
}

func (service *MockAdditionalStateService) GetAdditionalState() additional.AdditionalState {
	args := service.Called()
	return args.Get(0).(additional.AdditionalState)
}

func (service *MockAdditionalStateService) SetAdditionalState(state additional.AdditionalState) {
	service.Called(state)
}

func (service *MockAdditionalStateService) CompareAdditionalState(state1 additional.AdditionalState, state2 additional.AdditionalState) bool {
	args := service.Called(state1, state2)
	return args.Bool(0)
}

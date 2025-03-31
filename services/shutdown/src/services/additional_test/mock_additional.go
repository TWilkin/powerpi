package additional_test

import (
	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
)

type MockAdditionalStateService struct {
	mock.Mock
}

func (service *MockAdditionalStateService) GetAdditionalState() models.AdditionalState {
	args := service.Called()
	return args.Get(0).(models.AdditionalState)
}

func (service *MockAdditionalStateService) SetAdditionalState(state models.AdditionalState) {
	service.Called(state)
}

func (service *MockAdditionalStateService) CompareAdditionalState(
	state1 models.AdditionalState,
	state2 models.AdditionalState,
) bool {
	args := service.Called(state1, state2)
	return args.Bool(0)
}

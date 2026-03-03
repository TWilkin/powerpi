package energyretriever

import (
	"time"

	"github.com/stretchr/testify/mock"
)

type MockEnergyRetriever struct {
	mock.Mock
}

func (energyRetriever *MockEnergyRetriever) GetMeterType() string {
	args := energyRetriever.Called()
	return args.String(0)
}

func (energyRetriever *MockEnergyRetriever) GetStartDate() time.Time {
	args := energyRetriever.Called()
	return args.Get(0).(time.Time)
}

func (energyRetriever *MockEnergyRetriever) Read() {
	energyRetriever.Called()
}

func (energyRetriever *MockEnergyRetriever) PublishValue(value float64, unit string, timestamp int64) {
	energyRetriever.Called(value, unit, timestamp)
}

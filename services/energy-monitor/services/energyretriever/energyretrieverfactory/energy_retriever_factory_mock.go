package energyretrieverfactory

import (
	"github.com/stretchr/testify/mock"

	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type MockEnergyRetrieverFactory struct {
	mock.Mock
}

func (factory *MockEnergyRetrieverFactory) BuildRetriever(meter models.MeterSensor) energyRetriever.EnergyRetriever {
	args := factory.Called(meter)

	if args.Get(0) == nil {
		return nil
	}

	return args.Get(0).(energyRetriever.EnergyRetriever)
}

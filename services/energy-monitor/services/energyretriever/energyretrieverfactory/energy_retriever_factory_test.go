package energyretrieverfactory

import (
	"testing"

	"powerpi/common/services/http"
	"powerpi/common/services/logger"
	messageQueue "powerpi/common/services/mqtt/messagequeue"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
)

func TestBuildRetriever(t *testing.T) {
	var tests = []struct {
		name           string
		meter          models.MeterSensor
		expectedNonNil bool
	}{
		{
			"returns retriever for Octopus electricity meter",
			&models.OctopusElectricityMeterSensor{
				ElectricityMeterSensor: models.ElectricityMeterSensor{
					MPAN: "test-mpan",
				},
			},
			true,
		},
		{
			"returns retriever for Octopus gas meter",
			&models.OctopusGasMeterSensor{
				GasMeterSensor: models.GasMeterSensor{
					MPRN: "test-mprn",
				},
			},
			true,
		},
		{
			"returns nil for unsupported meter type",
			&models.ElectricityMeterSensor{
				MPAN: "test-mpan",
			},
			false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			factory := NewEnergyRetrieverFactory(
				&messageQueue.MockEventMessageService{},
				http.SetupMockHTTPClientFactory(),
				&config.MockConfigService{},
				logger.SetupMockLoggerService(),
			)

			retriever := factory.BuildRetriever(test.meter)

			if test.expectedNonNil && retriever == nil {
				t.Errorf("Expected retriever to be non-nil for meter type %T", test.meter)
			}
			if !test.expectedNonNil && retriever != nil {
				t.Errorf("Expected retriever to be nil for unsupported meter type %T", test.meter)
			}
		})
	}
}

func TestNewEnergyRetrieverFactory(t *testing.T) {
	eventMessageService := &messageQueue.MockEventMessageService{}
	httpClientFactory := http.SetupMockHTTPClientFactory()
	configService := &config.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()

	factory := NewEnergyRetrieverFactory(
		eventMessageService,
		httpClientFactory,
		configService,
		loggerService,
	)

	if factory == nil {
		t.Error("Expected factory to be non-nil")
	}
}

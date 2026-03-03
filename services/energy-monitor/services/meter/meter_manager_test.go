package meter

import (
	"reflect"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	commonModels "powerpi/common/models"
	"powerpi/common/services/logger"
	"powerpi/energy-monitor/services/config"
	"powerpi/energy-monitor/services/energyretriever"
	energyRetrieverFactory "powerpi/energy-monitor/services/energyretriever/energyretrieverfactory"
)

func TestNewMeterManager(t *testing.T) {
	configService := &config.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()
	factory := &energyRetrieverFactory.MockEnergyRetrieverFactory{}

	manager := NewMeterManager(configService, loggerService, factory)

	assert.NotNil(t, manager)
	assert.IsType(t, &meterManager{}, manager)
}

func TestMeterManagerStart(t *testing.T) {
	tests := []struct {
		name           string
		configData     map[string]interface{}
		expectedMeters int
		setupMocks     func(*config.MockConfigService, *energyRetrieverFactory.MockEnergyRetrieverFactory)
	}{
		{
			name: "successful start with electricity meter",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name":         "test-electricity-meter",
						"type":         "octopus_electricity_meter",
						"mpan":         "1234567890123",
						"serialNumber": "E123456789",
					},
				},
			},
			expectedMeters: 1,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				mockRetriever := &energyretriever.MockEnergyRetriever{}
				mockRetriever.On("Read").Return()
				factory.On("BuildRetriever", mock.Anything).Return(mockRetriever)
			},
		},
		{
			name: "successful start with gas meter",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name":         "test-gas-meter",
						"type":         "octopus_gas_meter",
						"mprn":         "9876543210",
						"serialNumber": "G987654321",
						"generation":   "SMETS2",
					},
				},
			},
			expectedMeters: 1,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				mockRetriever := &energyretriever.MockEnergyRetriever{}
				mockRetriever.On("Read").Return()
				factory.On("BuildRetriever", mock.Anything).Return(mockRetriever)
			},
		},
		{
			name: "successful start with multiple meters",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name":         "test-electricity-meter",
						"type":         "octopus_electricity_meter",
						"mpan":         "1234567890123",
						"serialNumber": "E123456789",
					},
					map[string]interface{}{
						"name":         "test-gas-meter",
						"type":         "octopus_gas_meter",
						"mprn":         "9876543210",
						"serialNumber": "G987654321",
						"generation":   "SMETS2",
					},
				},
			},
			expectedMeters: 2,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				mockRetriever := &energyretriever.MockEnergyRetriever{}
				mockRetriever.On("Read").Return()
				factory.On("BuildRetriever", mock.Anything).Return(mockRetriever).Twice()
			},
		},
		{
			name: "ignores non-meter sensors",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name": "test-temperature-sensor",
						"type": "temperature_sensor",
					},
					map[string]interface{}{
						"name":         "test-electricity-meter",
						"type":         "octopus_electricity_meter",
						"mpan":         "1234567890123",
						"serialNumber": "E123456789",
					},
				},
			},
			expectedMeters: 1,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				mockRetriever := &energyretriever.MockEnergyRetriever{}
				mockRetriever.On("Read").Return()
				factory.On("BuildRetriever", mock.Anything).Return(mockRetriever)
			},
		},
		{
			name: "handles invalid sensor data",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name": "invalid-meter",
						"type": "octopus_electricity_meter",
					},
				},
			},
			expectedMeters: 1,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				factory.On("BuildRetriever", mock.Anything).Return(nil)
			},
		},
		{
			name: "handles unsupported meter type",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name": "unsupported-meter",
						"type": "unsupported_meter",
					},
				},
			},
			expectedMeters: 0,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
			},
		},
		{
			name:           "handles empty sensors list",
			configData:     map[string]interface{}{"sensors": []interface{}{}},
			expectedMeters: 0,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
			},
		},
		{
			name:           "handles invalid sensors format",
			configData:     map[string]interface{}{"sensors": "invalid"},
			expectedMeters: 0,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
			},
		},
		{
			name: "handles factory returning nil retriever",
			configData: map[string]interface{}{
				"sensors": []interface{}{
					map[string]interface{}{
						"name":         "test-electricity-meter",
						"type":         "octopus_electricity_meter",
						"mpan":         "1234567890123",
						"serialNumber": "E123456789",
					},
				},
			},
			expectedMeters: 1,
			setupMocks: func(configService *config.MockConfigService, factory *energyRetrieverFactory.MockEnergyRetrieverFactory) {
				factory.On("BuildRetriever", mock.Anything).Return(nil)
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			configService := &config.MockConfigService{}
			loggerService := logger.SetupMockLoggerService()
			factory := &energyRetrieverFactory.MockEnergyRetrieverFactory{}

			testConfig := commonModels.Config{
				Data: test.configData,
			}

			configService.On("GetConfig", commonModels.ConfigTypeDevices).Return(testConfig)
			test.setupMocks(configService, factory)

			manager := NewMeterManager(configService, loggerService, factory).(*meterManager)

			manager.Start()

			assert.Len(t, manager.meters, test.expectedMeters)
			configService.AssertExpectations(t)
			factory.AssertExpectations(t)
		})
	}
}

func TestMeterManagerReadSensor(t *testing.T) {
	tests := []struct {
		name           string
		sensorType     string
		sensorMap      map[string]interface{}
		expectedResult bool
		expectedType   string
	}{
		{
			name:       "valid octopus electricity meter",
			sensorType: "octopus_electricity_meter",
			sensorMap: map[string]interface{}{
				"name":         "test-electricity-meter",
				"mpan":         "1234567890123",
				"serialNumber": "E123456789",
			},
			expectedResult: true,
			expectedType:   "*models.OctopusElectricityMeterSensor",
		},
		{
			name:       "valid octopus gas meter",
			sensorType: "octopus_gas_meter",
			sensorMap: map[string]interface{}{
				"name":         "test-gas-meter",
				"mprn":         "9876543210",
				"serialNumber": "G987654321",
				"generation":   "SMETS2",
			},
			expectedResult: true,
			expectedType:   "*models.OctopusGasMeterSensor",
		},
		{
			name:           "unsupported sensor type",
			sensorType:     "unsupported_meter",
			sensorMap:      map[string]interface{}{"name": "test"},
			expectedResult: false,
		},
		{
			name:       "invalid json marshaling",
			sensorType: "octopus_electricity_meter",
			sensorMap: map[string]interface{}{
				"invalid": make(chan int),
			},
			expectedResult: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			configService := &config.MockConfigService{}
			loggerService := logger.SetupMockLoggerService()
			factory := &energyRetrieverFactory.MockEnergyRetrieverFactory{}

			manager := NewMeterManager(configService, loggerService, factory).(*meterManager)

			result := manager.readSensor(test.sensorType, test.sensorMap)

			if test.expectedResult {
				assert.NotNil(t, result)
				assert.Equal(t, test.expectedType, reflect.TypeOf(result).String())
			} else {
				assert.Nil(t, result)
			}
		})
	}
}

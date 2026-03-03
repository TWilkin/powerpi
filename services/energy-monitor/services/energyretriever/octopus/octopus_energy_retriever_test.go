package octopus

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	commonModels "powerpi/common/models"
	httpService "powerpi/common/services/http"
	"powerpi/common/services/logger"
	messageQueue "powerpi/common/services/mqtt/messagequeue"
	"powerpi/energy-monitor/config"
	"powerpi/energy-monitor/models"
	configService "powerpi/energy-monitor/services/config"
)

func TestNewOctopusEnergyRetriever(t *testing.T) {
	eventMessageService := &messageQueue.MockEventMessageService{}
	httpClientFactory := httpService.SetupMockHTTPClientFactory()
	configService := &configService.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()
	meter := createTestElectricityMeter()

	retriever := NewOctopusEnergyRetriever(
		eventMessageService,
		httpClientFactory,
		configService,
		loggerService,
		meter,
	)

	assert.NotNil(t, retriever)
	assert.NotNil(t, retriever.BaseEnergyRetriever)
	assert.Equal(t, httpClientFactory, retriever.httpClientFactory)
	assert.Equal(t, eventMessageService, retriever.EventMessageService)
	assert.Equal(t, configService, retriever.Config)
	assert.Equal(t, loggerService, retriever.Logger)
	assert.Equal(t, meter, retriever.Meter)
}

func TestRead(t *testing.T) {
	eventMessageService := &messageQueue.MockEventMessageService{}
	httpClientFactory := httpService.SetupMockHTTPClientFactory()
	configService := &configService.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()
	meter := createTestElectricityMeter()

	retriever := NewOctopusEnergyRetriever(
		eventMessageService,
		httpClientFactory,
		configService,
		loggerService,
		meter,
	)

	// Mock the config for GetStartDate
	mockConfig := config.EnergyMonitorConfig{
		History: 7,
	}
	configService.TestEnergyMonitorConfig = mockConfig

	// Mock GetOctopusAPIKey
	apiKey := "test-api-key"
	configService.TestOctopusAPIKey = &apiKey

	// Setup event message service mock with specific value verification
	eventMessageService.On("SubscribeValue", meter.GetName(), "electricity", mock.AnythingOfType("chan<- *messagequeue.EventMessage")).Run(func(args mock.Arguments) {
		channel := args.Get(2).(chan<- *messageQueue.EventMessage)

		go func() {
			message := &messageQueue.EventMessage{}
			message.SetTimestamp(time.Now().Add(-1 * time.Hour).UnixMilli())
			channel <- message
		}()
	}).Return()
	eventMessageService.On("UnsubscribeValue", meter.GetName(), "electricity").Return()
	eventMessageService.On("PublishValueWithTime", meter.GetName(), "electricity", 5.5, "kWh", mock.AnythingOfType("*int64")).Return()
	eventMessageService.On("PublishValueWithTime", meter.GetName(), "electricity", 3.2, "kWh", mock.AnythingOfType("*int64")).Return()

	// Create mock HTTP response
	mockResponse := createMockConsumptionResponse([]ConsumptionResult{
		{
			Consumption:   5.5,
			IntervalStart: time.Now().Add(-2 * time.Hour),
			IntervalEnd:   time.Now().Add(-1 * time.Hour),
		},
		{
			Consumption:   3.2,
			IntervalStart: time.Now().Add(-1 * time.Hour),
			IntervalEnd:   time.Now(),
		},
	}, nil)

	// Setup HTTP client mock with specific response
	mockClient := httpService.SetupMockHTTPClientWithResponse(mockResponse, nil)
	httpClientFactory.TestClient = mockClient

	retriever.Read()

	// Verify calls
	eventMessageService.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}

func TestReadConsumption(t *testing.T) {
	tests := []struct {
		name              string
		meter             models.OctopusMeterSensor
		expectedMeterType string
		expectedUnit      string
		consumptionData   []ConsumptionResult
	}{
		{
			name:              "electricity meter",
			meter:             createTestElectricityMeter(),
			expectedMeterType: "electricity",
			expectedUnit:      "kWh",
			consumptionData: []ConsumptionResult{
				{
					Consumption:   1.5,
					IntervalStart: time.Now().Add(-2 * time.Hour),
					IntervalEnd:   time.Now().Add(-1 * time.Hour),
				},
				{
					Consumption:   2.3,
					IntervalStart: time.Now().Add(-1 * time.Hour),
					IntervalEnd:   time.Now(),
				},
			},
		},
		{
			name:              "gas meter SMETS1",
			meter:             createTestGasMeter("SMETS1"),
			expectedMeterType: "gas",
			expectedUnit:      "kWh",
			consumptionData: []ConsumptionResult{
				{
					Consumption:   3.2,
					IntervalStart: time.Now().Add(-3 * time.Hour),
					IntervalEnd:   time.Now().Add(-2 * time.Hour),
				},
			},
		},
		{
			name:              "gas meter SMETS2",
			meter:             createTestGasMeter("SMETS2"),
			expectedMeterType: "gas",
			expectedUnit:      "m3",
			consumptionData: []ConsumptionResult{
				{
					Consumption:   4.7,
					IntervalStart: time.Now().Add(-4 * time.Hour),
					IntervalEnd:   time.Now().Add(-3 * time.Hour),
				},
				{
					Consumption:   5.1,
					IntervalStart: time.Now().Add(-3 * time.Hour),
					IntervalEnd:   time.Now().Add(-2 * time.Hour),
				},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			eventMessageService := &messageQueue.MockEventMessageService{}
			httpClientFactory := httpService.SetupMockHTTPClientFactory()
			configService := &configService.MockConfigService{}
			loggerService := logger.SetupMockLoggerService()

			retriever := NewOctopusEnergyRetriever(
				eventMessageService,
				httpClientFactory,
				configService,
				loggerService,
				test.meter,
			)

			// Mock config
			mockConfig := config.EnergyMonitorConfig{
				History:           7,
				MessageWriteDelay: 100,
			}
			configService.TestEnergyMonitorConfig = mockConfig

			apiKey := "test-api-key"
			configService.TestOctopusAPIKey = &apiKey

			// Setup event message service mock with specific value verification
			eventMessageService.On("SubscribeValue", test.meter.GetName(), test.expectedMeterType, mock.AnythingOfType("chan<- *messagequeue.EventMessage")).Run(func(args mock.Arguments) {
				channel := args.Get(2).(chan<- *messageQueue.EventMessage)
				go func() {
					message := &messageQueue.EventMessage{}
					message.SetTimestamp(time.Now().Add(-1 * time.Hour).UnixMilli())
					channel <- message
				}()
			}).Return()
			eventMessageService.On("UnsubscribeValue", test.meter.GetName(), test.expectedMeterType).Return()

			// Verify each consumption value and unit is published correctly
			for _, result := range test.consumptionData {
				eventMessageService.On("PublishValueWithTime",
					test.meter.GetName(),
					test.expectedMeterType,
					result.Consumption,
					test.expectedUnit,
					mock.AnythingOfType("*int64")).Return()
			}

			mockResponse := createMockConsumptionResponse(test.consumptionData, nil)

			// Setup HTTP client mock using the improved helper
			mockClient := httpService.SetupMockHTTPClientWithResponse(mockResponse, nil)
			httpClientFactory.TestClient = mockClient

			retriever.readConsumption()

			// Verify all expectations
			eventMessageService.AssertExpectations(t)
			mockClient.AssertExpectations(t)
		})
	}
}

func TestReadConsumptionWithPagination(t *testing.T) {
	eventMessageService := &messageQueue.MockEventMessageService{}
	httpClientFactory := httpService.SetupMockHTTPClientFactory()
	configService := &configService.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()
	meter := createTestElectricityMeter()

	retriever := NewOctopusEnergyRetriever(
		eventMessageService,
		httpClientFactory,
		configService,
		loggerService,
		meter,
	)

	// Mock config
	mockConfig := config.EnergyMonitorConfig{
		History:           7,
		MessageWriteDelay: 50,
	}
	configService.TestEnergyMonitorConfig = mockConfig

	apiKey := "test-api-key"
	configService.TestOctopusAPIKey = &apiKey

	// Setup event message service mock with specific value verification
	eventMessageService.On("SubscribeValue", meter.GetName(), "electricity", mock.AnythingOfType("chan<- *messagequeue.EventMessage")).Run(func(args mock.Arguments) {
		channel := args.Get(2).(chan<- *messageQueue.EventMessage)
		go func() {
			message := &messageQueue.EventMessage{}
			message.SetTimestamp(time.Now().Add(-1 * time.Hour).UnixMilli())
			channel <- message
		}()
	}).Return()
	eventMessageService.On("UnsubscribeValue", meter.GetName(), "electricity").Return()
	eventMessageService.On("PublishValueWithTime", meter.GetName(), "electricity", 1.0, "kWh", mock.AnythingOfType("*int64")).Return()
	eventMessageService.On("PublishValueWithTime", meter.GetName(), "electricity", 2.0, "kWh", mock.AnythingOfType("*int64")).Return()

	// First page response
	nextURL := "https://api.octopus.energy/v1/electricity-meter-points/test-mpan/meters/test-serial/consumption?page=2"
	firstPageResults := []ConsumptionResult{
		{
			Consumption:   1.0,
			IntervalStart: time.Now().Add(-4 * time.Hour),
			IntervalEnd:   time.Now().Add(-3 * time.Hour),
		},
	}
	firstPageResponse := createMockConsumptionResponse(firstPageResults, &nextURL)

	// Second page response (final page)
	secondPageResults := []ConsumptionResult{
		{
			Consumption:   2.0,
			IntervalStart: time.Now().Add(-2 * time.Hour),
			IntervalEnd:   time.Now().Add(-1 * time.Hour),
		},
	}
	secondPageResponse := createMockConsumptionResponse(secondPageResults, nil)

	// Setup HTTP client mock with pagination - need custom setup for multiple calls
	mockClient := &httpService.MockHTTPClient{}
	mockClient.On("getLogger").Return(logger.SetupMockLoggerService())
	mockClient.On("SetBasicAuth", "test-api-key", "").Return()
	mockClient.On("Get", mock.MatchedBy(func(url string) bool {
		return !strings.Contains(url, "page=2")
	})).Return(firstPageResponse, nil).Once()
	mockClient.On("Get", nextURL).Return(secondPageResponse, nil).Once()
	httpClientFactory.TestClient = mockClient

	retriever.readConsumption()

	// Verify all expectations
	eventMessageService.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}

func TestReadConsumptionHTTPError(t *testing.T) {
	eventMessageService := &messageQueue.MockEventMessageService{}
	httpClientFactory := httpService.SetupMockHTTPClientFactory()
	configService := &configService.MockConfigService{}
	loggerService := logger.SetupMockLoggerService()
	meter := createTestElectricityMeter()

	retriever := NewOctopusEnergyRetriever(
		eventMessageService,
		httpClientFactory,
		configService,
		loggerService,
		meter,
	)

	// Mock config
	mockConfig := config.EnergyMonitorConfig{
		History: 7,
	}
	configService.TestEnergyMonitorConfig = mockConfig

	apiKey := "test-api-key"
	configService.TestOctopusAPIKey = &apiKey

	// Setup event message service mock for error case - no PublishValueWithTime expected
	eventMessageService.On("SubscribeValue", meter.GetName(), "electricity", mock.AnythingOfType("chan<- *messagequeue.EventMessage")).Run(func(args mock.Arguments) {
		channel := args.Get(2).(chan<- *messageQueue.EventMessage)
		go func() {
			message := &messageQueue.EventMessage{}
			message.SetTimestamp(time.Now().Add(-1 * time.Hour).UnixMilli())
			channel <- message
		}()
	}).Return()
	eventMessageService.On("UnsubscribeValue", meter.GetName(), "electricity").Return()

	// Setup HTTP client mock to return error
	mockClient := httpService.SetupMockHTTPClientWithResponse((*http.Response)(nil), fmt.Errorf("HTTP request failed"))
	httpClientFactory.TestClient = mockClient

	// Should not call PublishValueWithTime due to error
	retriever.readConsumption()

	// Verify expectations
	eventMessageService.AssertExpectations(t)
	mockClient.AssertExpectations(t)
}

func createTestElectricityMeter() *models.OctopusElectricityMeterSensor {
	meter := &models.OctopusElectricityMeterSensor{}

	meter.MPAN = "test-mpan"
	meter.SerialNumber = "test-serial"
	meter.Name = "test-electricity-meter"
	meter.Metrics = map[models.MeterMetric]commonModels.MetricValue{
		models.MeterMetricElectricity: commonModels.MetricValueRead,
	}

	return meter
}

func createTestGasMeter(generation string) *models.OctopusGasMeterSensor {
	meter := &models.OctopusGasMeterSensor{}

	meter.MPRN = "test-mprn"
	meter.SerialNumber = "test-serial"
	meter.Name = "test-gas-meter"
	meter.Generation = generation
	meter.Metrics = map[models.MeterMetric]commonModels.MetricValue{
		models.MeterMetricGas: commonModels.MetricValueRead,
	}

	return meter
}

func createMockConsumptionResponse(results []ConsumptionResult, nextURL *string) *http.Response {
	response := ConsumptionResponse{
		Count:   len(results),
		Results: results,
		Next:    nextURL,
	}

	jsonData, _ := json.Marshal(response)

	return &http.Response{
		StatusCode: http.StatusOK,
		Status:     "200 OK",
		Body:       io.NopCloser(bytes.NewBuffer(jsonData)),
		Header:     make(http.Header),
	}
}

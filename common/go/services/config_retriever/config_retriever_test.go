package configretriever

import (
	"testing"
	"time"

	"github.com/stretchr/testify/mock"

	"powerpi/common/models"
	"powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt/messagequeue"
)

func TestNewConfigRetriever(t *testing.T) {
	mockConfigService := &config.MockConfigService{}
	mockMessageService := &messagequeue.MockConfigMessageService{}
	mockLogger := logger.SetupMockLoggerService()

	retriever := NewConfigRetriever(mockConfigService, mockMessageService, mockLogger)

	if retriever == nil {
		t.Error("Expected NewConfigRetriever to return a non-nil retriever")
	}
}

func TestWaitForConfigNoRequiredConfig(t *testing.T) {
	mockConfigService := &config.MockConfigService{}
	mockMessageService := &messagequeue.MockConfigMessageService{}
	mockLogger := logger.SetupMockLoggerService()

	// Mock no required config
	mockConfigService.On("RequiredConfig").Return([]models.ConfigType{})

	retriever := NewConfigRetriever(mockConfigService, mockMessageService, mockLogger)
	retriever.WaitForConfig()

	mockConfigService.AssertExpectations(t)
	mockMessageService.AssertExpectations(t)
}

func TestWaitForConfigSuccessfulRetrieval(t *testing.T) {
	mockConfigService := &config.MockConfigService{}
	mockMessageService := &messagequeue.MockConfigMessageService{}
	mockLogger := logger.SetupMockLoggerService()

	requiredConfigTypes := []models.ConfigType{models.ConfigTypeDevices, models.ConfigTypeUsers}
	mockConfigService.On("RequiredConfig").Return(requiredConfigTypes)

	// Set up expectations for each config type
	for _, configType := range requiredConfigTypes {
		mockMessageService.On("SubscribeChange", configType, mock.AnythingOfType("chan<- *messagequeue.ConfigMessage")).Run(func(args mock.Arguments) {
			// Get the channel from the arguments
			channel := args.Get(1).(chan<- *messagequeue.ConfigMessage)

			// Send a message to the channel in a goroutine to simulate async behaviour
			go func() {
				time.Sleep(10 * time.Millisecond) // Small delay to ensure subscription is set up
				testMessage := &messagequeue.ConfigMessage{
					Payload:  map[string]any{"test": "data"},
					Checksum: "test-checksum",
				}
				channel <- testMessage
			}()
		})

		mockMessageService.On("UnsubscribeChange", configType)
		mockConfigService.On("SetConfig", configType, map[string]any{"test": "data"}, "test-checksum")
	}

	retriever := NewConfigRetriever(mockConfigService, mockMessageService, mockLogger)

	// Use a timeout to ensure the test doesn't hang
	done := make(chan bool)
	go func() {
		retriever.WaitForConfig()
		done <- true
	}()

	select {
	case <-done:
		// Test completed successfully
	case <-time.After(5 * time.Second):
		t.Error("WaitForConfig took too long to complete")
	}

	mockConfigService.AssertExpectations(t)
	mockMessageService.AssertExpectations(t)
}

func TestWaitForConfigMultipleTypes(t *testing.T) {
	mockConfigService := &config.MockConfigService{}
	mockMessageService := &messagequeue.MockConfigMessageService{}
	mockLogger := logger.SetupMockLoggerService()

	requiredConfigTypes := []models.ConfigType{
		models.ConfigTypeDevices,
		models.ConfigTypeEvents,
		models.ConfigTypeSchedules,
		models.ConfigTypeUsers,
	}
	mockConfigService.On("RequiredConfig").Return(requiredConfigTypes)

	// Set up expectations for each config type with different data
	testData := map[models.ConfigType]map[string]any{
		models.ConfigTypeDevices:   {"devices": []string{"device1", "device2"}},
		models.ConfigTypeEvents:    {"events": []string{"event1"}},
		models.ConfigTypeSchedules: {"schedules": []string{"schedule1"}},
		models.ConfigTypeUsers:     {"users": []string{"user1"}},
	}

	for _, configType := range requiredConfigTypes {
		payload := testData[configType]
		checksum := string(configType) + "-checksum"

		mockMessageService.On("SubscribeChange", configType, mock.AnythingOfType("chan<- *messagequeue.ConfigMessage")).Run(func(args mock.Arguments) {
			channel := args.Get(1).(chan<- *messagequeue.ConfigMessage)

			go func() {
				time.Sleep(10 * time.Millisecond)
				testMessage := &messagequeue.ConfigMessage{
					Payload:  payload,
					Checksum: checksum,
				}
				channel <- testMessage
			}()
		})

		mockMessageService.On("UnsubscribeChange", configType)
		mockConfigService.On("SetConfig", configType, payload, checksum)
	}

	retriever := NewConfigRetriever(mockConfigService, mockMessageService, mockLogger)

	done := make(chan bool)
	go func() {
		retriever.WaitForConfig()
		done <- true
	}()

	select {
	case <-done:
		// Test completed successfully
	case <-time.After(5 * time.Second):
		t.Error("WaitForConfig took too long to complete")
	}

	mockConfigService.AssertExpectations(t)
	mockMessageService.AssertExpectations(t)
}

package logger

import "github.com/stretchr/testify/mock"

type MockLoggerService struct {
	mock.Mock
}

func (logger *MockLoggerService) Start(service string, version string) {
	logger.Called(service, version)
}

func (logger *MockLoggerService) SetLevel(level string) {
	logger.Called(level)
}

func (logger *MockLoggerService) Debug(message string, args ...any) {
	logger.Called(message, args)
}

func (logger *MockLoggerService) Info(message string, args ...any) {
	logger.Called(message, args)
}

func (logger *MockLoggerService) Warn(message string, args ...any) {
	logger.Called(message, args)
}

func (logger *MockLoggerService) Error(message string, args ...any) {
	logger.Called(message, args)
}

func SetupMockLoggerService() *MockLoggerService {
	mockLogger := &MockLoggerService{}

	mockLogger.On("Start", mock.Anything, mock.Anything)
	mockLogger.On("SetLevel", mock.Anything)
	mockLogger.On("Debug", mock.Anything, mock.Anything)
	mockLogger.On("Info", mock.Anything, mock.Anything)
	mockLogger.On("Warn", mock.Anything, mock.Anything)
	mockLogger.On("Error", mock.Anything, mock.Anything)

	return mockLogger
}

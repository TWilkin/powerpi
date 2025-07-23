package http

import (
	"net/http"

	"github.com/stretchr/testify/mock"

	"powerpi/common/services/logger"
)

type MockHTTPClient struct {
	mock.Mock
}

func (client *MockHTTPClient) getLogger() logger.LoggerService {
	args := client.Called()
	return args.Get(0).(logger.LoggerService)
}

func (client *MockHTTPClient) SetBasicAuth(username string, password string) {
	client.Called(username, password)
}

func (client *MockHTTPClient) Get(url string) (*http.Response, error) {
	args := client.Called(url)
	return args.Get(0).(*http.Response), args.Error(1)
}

func SetupMockHTTPClient() *MockHTTPClient {
	mockClient := &MockHTTPClient{}

	mockClient.On("getLogger").Return(logger.SetupMockLoggerService())
	mockClient.On("SetBasicAuth", mock.Anything, mock.Anything)
	mockClient.On("Get", mock.Anything).Return(&http.Response{}, nil)

	return mockClient
}

package http

import (
	"net/http"

	"github.com/stretchr/testify/mock"
)

type MockHTTPClient struct {
	mock.Mock
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

	mockClient.On("SetBasicAuth", mock.Anything, mock.Anything)
	mockClient.On("Get", mock.Anything).Return(&http.Response{}, nil)

	return mockClient
}
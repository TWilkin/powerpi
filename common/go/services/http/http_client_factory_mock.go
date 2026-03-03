package http

import "github.com/stretchr/testify/mock"

type MockHTTPClientFactory struct {
	mock.Mock
	TestClient HTTPClient
}

func (factory *MockHTTPClientFactory) BuildClient() HTTPClient {
	args := factory.Called()

	if factory.TestClient != nil {
		return factory.TestClient
	}

	return args.Get(0).(HTTPClient)
}

func SetupMockHTTPClientFactory() *MockHTTPClientFactory {
	mockFactory := &MockHTTPClientFactory{}
	mockClient := SetupMockHTTPClient()

	mockFactory.TestClient = mockClient
	mockFactory.On("BuildClient").Return(mockClient)

	return mockFactory
}

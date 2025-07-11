package http

import "powerpi/common/services/logger"

type HTTPClientFactory interface {
	BuildClient() HTTPClient
}

type httpClientFactory struct {
	logger logger.LoggerService
}

func NewHTTPClientFactory(logger logger.LoggerService) HTTPClientFactory {
	return httpClientFactory{
		logger: logger,
	}
}

func (factory httpClientFactory) BuildClient() HTTPClient {
	return NewHTTPClient(factory.logger)
}

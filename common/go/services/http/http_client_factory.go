package http

type HTTPClientFactory func() HTTPClient

func NewHTTPClientFactory() HTTPClientFactory {
	return func() HTTPClient {
		return NewHTTPClient()
	}
}

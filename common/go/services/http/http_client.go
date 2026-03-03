package http

import (
	"encoding/json"
	"io"
	"net/http"
	"powerpi/common/services/logger"
)

type HTTPClient interface {
	getLogger() logger.LoggerService

	SetBasicAuth(username string, password string)

	Get(url string) (*http.Response, error)
}

type httpClient struct {
	client *http.Client
	logger logger.LoggerService

	username *string
	password *string
}

func NewHTTPClient(logger logger.LoggerService) HTTPClient {
	return &httpClient{
		client:   http.DefaultClient,
		logger:   logger,
		username: nil,
		password: nil,
	}
}

func (client *httpClient) getLogger() logger.LoggerService {
	return client.logger
}

func (client *httpClient) SetBasicAuth(username string, password string) {
	client.username = &username
	client.password = &password
}

func (client *httpClient) Get(url string) (*http.Response, error) {
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if client.username != nil || client.password != nil {
		username := ""
		if client.username != nil {
			username = *client.username
		}

		password := ""
		if client.password != nil {
			password = *client.password
		}

		request.SetBasicAuth(username, password)
	}

	return client.client.Do(request)
}

func Get[TResponse any](client HTTPClient, url string) (*TResponse, error) {
	response, err := client.Get(url)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, &HTTPError{
			StatusCode: response.StatusCode,
			Status:     response.Status,
		}
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	client.getLogger().Debug("Received response", "url", url, "status", response.Status, "body", string(body))

	var result TResponse
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"powerpi/common/services/logger"
)

type TestResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

func TestNewHTTPClient(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	if httpClient == nil {
		t.Error("Expected NewHTTPClient to return a non-nil client")
	}

	if httpClient.getLogger() != mockLogger {
		t.Error("Expected logger to be set correctly")
	}
}

func TestSetBasicAuth(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger).(*httpClient)

	expectedUsername := "testuser"
	expectedPassword := "testpass"

	httpClient.SetBasicAuth(expectedUsername, expectedPassword)

	if httpClient.username == nil {
		t.Error("Expected username to be set")
	} else if *httpClient.username != expectedUsername {
		t.Errorf("Expected username %q, got %q", expectedUsername, *httpClient.username)
	}

	if httpClient.password == nil {
		t.Error("Expected password to be set")
	} else if *httpClient.password != expectedPassword {
		t.Errorf("Expected password %q, got %q", expectedPassword, *httpClient.password)
	}
}

func TestGetWithoutAuth(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		// Verify no auth header is present
		authHeader := request.Header.Get("Authorization")
		if authHeader != "" {
			t.Errorf("Expected no Authorization header, got %q", authHeader)
		}

		responseWriter.WriteHeader(http.StatusOK)
		responseWriter.Write([]byte("test response"))
	}))
	defer testServer.Close()

	response, err := httpClient.Get(testServer.URL)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.StatusCode)
	}
}

func TestGetWithBasicAuth(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	expectedUsername := "testuser"
	expectedPassword := "testpass"
	httpClient.SetBasicAuth(expectedUsername, expectedPassword)

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		// Verify auth header is present and correct
		username, password, success := request.BasicAuth()
		if !success {
			t.Error("Expected basic auth to be present")
		}
		if username != expectedUsername {
			t.Errorf("Expected username %q, got %q", expectedUsername, username)
		}
		if password != expectedPassword {
			t.Errorf("Expected password %q, got %q", expectedPassword, password)
		}

		responseWriter.WriteHeader(http.StatusOK)
		responseWriter.Write([]byte("authenticated response"))
	}))
	defer testServer.Close()

	response, err := httpClient.Get(testServer.URL)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.StatusCode)
	}
}

func TestGetWithPartialAuth(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger).(*httpClient)

	// Set only username, password should be empty
	expectedUsername := "testuser"
	httpClient.username = &expectedUsername
	httpClient.password = nil

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		// Verify auth header is present with empty password
		username, password, success := request.BasicAuth()
		if !success {
			t.Error("Expected basic auth to be present")
		}
		if username != expectedUsername {
			t.Errorf("Expected username %q, got %q", expectedUsername, username)
		}
		if password != "" {
			t.Errorf("Expected empty password, got %q", password)
		}

		responseWriter.WriteHeader(http.StatusOK)
		responseWriter.Write([]byte("partial auth response"))
	}))
	defer testServer.Close()

	response, err := httpClient.Get(testServer.URL)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.StatusCode)
	}
}

func TestGetGenericSuccess(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	expectedResponse := TestResponse{
		Message: "hello",
		Status:  "success",
	}

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		json.NewEncoder(responseWriter).Encode(expectedResponse)
	}))
	defer testServer.Close()

	result, err := Get[TestResponse](httpClient, testServer.URL)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result == nil {
		t.Error("Expected non-nil result")
		return
	}

	if result.Message != expectedResponse.Message {
		t.Errorf("Expected message %q, got %q", expectedResponse.Message, result.Message)
	}

	if result.Status != expectedResponse.Status {
		t.Errorf("Expected status %q, got %q", expectedResponse.Status, result.Status)
	}

}

func TestGetGenericHTTPError(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		responseWriter.WriteHeader(http.StatusNotFound)
		responseWriter.Write([]byte("Not Found"))
	}))
	defer testServer.Close()

	result, err := Get[TestResponse](httpClient, testServer.URL)

	if result != nil {
		t.Error("Expected nil result for error response")
	}

	if err == nil {
		t.Error("Expected error for non-200 status code")
		return
	}

	httpError, success := err.(*HTTPError)
	if !success {
		t.Errorf("Expected HTTPError, got %T", err)
		return
	}

	if httpError.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status code %d, got %d", http.StatusNotFound, httpError.StatusCode)
	}

	if !strings.Contains(httpError.Status, "Not Found") {
		t.Errorf("Expected status to contain 'Not Found', got %q", httpError.Status)
	}
}

func TestGetGenericInvalidJSON(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	testServer := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
		responseWriter.Write([]byte("invalid json"))
	}))
	defer testServer.Close()

	result, err := Get[TestResponse](httpClient, testServer.URL)

	if result != nil {
		t.Error("Expected nil result for invalid JSON")
	}

	if err == nil {
		t.Error("Expected error for invalid JSON")
		return
	}

	// Should be a JSON unmarshaling error
	if !strings.Contains(err.Error(), "invalid character") {
		t.Errorf("Expected JSON unmarshaling error, got %v", err)
	}

}

func TestGetInvalidURL(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	invalidURL := "://invalid-url"
	response, err := httpClient.Get(invalidURL)

	if response != nil {
		t.Error("Expected nil response for invalid URL")
	}

	if err == nil {
		t.Error("Expected error for invalid URL")
	}
}

func TestGetGenericInvalidURL(t *testing.T) {
	mockLogger := logger.SetupMockLoggerService()
	httpClient := NewHTTPClient(mockLogger)

	invalidURL := "://invalid-url"
	result, err := Get[TestResponse](httpClient, invalidURL)

	if result != nil {
		t.Error("Expected nil result for invalid URL")
	}

	if err == nil {
		t.Error("Expected error for invalid URL")
	}
}

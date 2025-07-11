package http

import "fmt"

type HTTPError struct {
	StatusCode int
	Status     string
	Body       string
}

func (error *HTTPError) Error() string {
	return fmt.Sprintf("HTTP Error: %s", error.Status)
}

package health

import (
	"net/http"

	"github.com/TWilkin/powerpi/common/services/logger"
)

type HealthService interface {
	Start()

	Check() bool
}

type healthService struct {
	logger logger.LoggerService
}

func NewHealthService(logger logger.LoggerService) HealthService {
	return healthService{
		logger: logger,
	}
}

func (health healthService) Start() {
	go func() {
		_ = http.ListenAndServe(":8080", http.HandlerFunc(
			func(writer http.ResponseWriter, request *http.Request) {
				if health.Check() {
					_, _ = writer.Write([]byte("healthy"))
				} else {
					writer.WriteHeader(500)
				}
			},
		))
	}()
}

func (health healthService) Check() bool {
	return true
}

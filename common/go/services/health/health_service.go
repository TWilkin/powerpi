package health

import (
	"net/http"

	"github.com/TWilkin/powerpi/common/services/logger"
)

type checkFunction func() bool

type HealthService interface {
	Start()
	StartWithCheck(check checkFunction)
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
	health.StartWithCheck(func() bool {
		return true
	})
}

func (health healthService) StartWithCheck(check checkFunction) {
	go func() {
		_ = http.ListenAndServe(":8080", http.HandlerFunc(
			func(writer http.ResponseWriter, request *http.Request) {
				if check() {
					_, _ = writer.Write([]byte("healthy"))
				} else {
					writer.WriteHeader(500)
				}
			},
		))
	}()
}

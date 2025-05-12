package logger

import (
	"log/slog"
)

type LoggerService interface {
	Start(service string, version string)

	Debug(message string, args ...any)
	Info(message string, args ...any)
	Warn(message string, args ...any)
	Error(message string, args ...any)
}

type loggerService struct {
	logger *slog.Logger
}

func NewLoggerService() LoggerService {
	logger := slog.New(&textHandler{level: slog.LevelInfo})

	slog.SetDefault(logger)

	return &loggerService{logger: logger}
}

func (log *loggerService) Start(service string, version string) {
	log.logger.Info(`
__________                         __________.__ 
\______   \______  _  __ __________\______   \__|
 |     ___/  _ \ \/ \/ // __ \_  __ \     ___/  |
 |    |  (  <_> )     /\  ___/|  | \/    |   |  |
 |____|   \____/ \/\_/  \___  >__|  |____|   |__|
                            \/`)
	log.logger.Info("Started", "service", service, "version", version)

}

func (log *loggerService) Debug(message string, args ...any) {
	log.logger.Debug(message, args...)
}

func (log *loggerService) Info(message string, args ...any) {
	log.logger.Info(message, args...)
}

func (log *loggerService) Warn(message string, args ...any) {
	log.logger.Warn(message, args...)
}

func (log *loggerService) Error(message string, args ...any) {
	log.logger.Error(message, args...)
}

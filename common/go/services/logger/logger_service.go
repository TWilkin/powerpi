package logger

import (
	"errors"
	"log/slog"
	"strings"
)

type LoggerService interface {
	Start(service string, version string)

	SetLevel(level string)

	Debug(message string, args ...any)
	Info(message string, args ...any)
	Warn(message string, args ...any)
	Error(message string, args ...any)
}

type loggerService struct {
	logger *slog.Logger
	level  *slog.LevelVar
}

func NewLoggerService() LoggerService {
	var level slog.LevelVar
	level.Set(slog.LevelInfo)

	logger := slog.New(&textHandler{level: &level})

	slog.SetDefault(logger)

	return &loggerService{logger: logger, level: &level}
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

func (log *loggerService) SetLevel(level string) {
	value, err := parseLogLevel(level)
	if err != nil {
		log.logger.Error("Failed to parse log level", "error", err)
	} else {
		log.level.Set(value)
	}
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

func parseLogLevel(levelStr string) (slog.Level, error) {
	switch strings.ToLower(levelStr) {
	case "debug":
		return slog.LevelDebug, nil

	case "info":
		return slog.LevelInfo, nil

	case "warn", "warning":
		return slog.LevelWarn, nil

	case "error":
		return slog.LevelError, nil

	default:
		return slog.LevelInfo, errors.New("Invalid log level: " + levelStr)
	}
}

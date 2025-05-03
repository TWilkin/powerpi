package logger

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

type textHandler struct {
	level slog.Leveler
}

func NewTextHandler(level slog.Leveler) *textHandler {
	return &textHandler{
		level: level,
	}
}

func (handler *textHandler) Enabled(context context.Context, level slog.Level) bool {
	return level >= handler.level.Level()
}

func (handler *textHandler) Handle(context context.Context, record slog.Record) error {
	colour := levelColour(record.Level)

	file, line := sourceFileAndLine(record.PC)

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	logLine := fmt.Sprintf(
		"%s[%s]%s %s %s:%d %s",
		colour, record.Level.String(), colorReset,
		timestamp,
		file, line,
		record.Message,
	)

	record.Attrs(func(attribute slog.Attr) bool {
		logLine += fmt.Sprintf(" | %s=%v", attribute.Key, attribute.Value)
		return true
	})

	fmt.Fprintln(os.Stdout, logLine)
	return nil
}

func (handler *textHandler) WithAttrs(attributes []slog.Attr) slog.Handler {
	return handler
}

func (handler *textHandler) WithGroup(name string) slog.Handler {
	return handler
}

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorYellow = "\033[33m"
	colorGreen  = "\033[32m"
	colorBlue   = "\033[34m"
)

func levelColour(level slog.Level) string {
	switch {
	case level >= slog.LevelError:
		return colorRed

	case level >= slog.LevelWarn:
		return colorYellow

	case level >= slog.LevelInfo:
		return colorGreen

	default:
		return colorBlue
	}
}

func sourceFileAndLine(pc uintptr) (string, int) {
	if pc == 0 {
		return "unknown", 0
	}

	fn := runtime.FuncForPC(pc)
	if fn == nil {
		return "unknown", 0
	}

	file, line := fn.FileLine(pc)
	return filepath.Base(file), line
}

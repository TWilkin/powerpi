package logger

import (
	"bytes"
	"io"
	"log/slog"
	"os"
	"strings"
	"testing"
)

func TestNewLoggerService(t *testing.T) {
	service := NewLoggerService()
	if service == nil {
		t.Error("Expected NewLoggerService to return a non-nil service")
	}
}

func TestSetLevel(t *testing.T) {
	tests := []struct {
		name     string
		level    string
		expected slog.Level
	}{
		{"debug level", "debug", slog.LevelDebug},
		{"info level", "info", slog.LevelInfo},
		{"warn level", "warn", slog.LevelWarn},
		{"warning level", "warning", slog.LevelWarn},
		{"error level", "error", slog.LevelError},
		{"Debug level uppercase", "DEBUG", slog.LevelDebug},
		{"Info level uppercase", "INFO", slog.LevelInfo},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service := NewLoggerService().(*loggerService)
			service.SetLevel(test.level)

			if service.level.Level() != test.expected {
				t.Errorf("Expected level %v, got %v", test.expected, service.level.Level())
			}
		})
	}
}

func TestParseLogLevel(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    slog.Level
		expectError bool
	}{
		{"debug", "debug", slog.LevelDebug, false},
		{"info", "info", slog.LevelInfo, false},
		{"warn", "warn", slog.LevelWarn, false},
		{"warning", "warning", slog.LevelWarn, false},
		{"error", "error", slog.LevelError, false},
		{"DEBUG uppercase", "DEBUG", slog.LevelDebug, false},
		{"INFO uppercase", "INFO", slog.LevelInfo, false},
		{"invalid", "invalid", slog.LevelInfo, true},
		{"empty", "", slog.LevelInfo, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			level, err := parseLogLevel(test.input)

			if test.expectError {
				if err == nil {
					t.Errorf("Expected error for input %q, got nil", test.input)
				}
				if !strings.Contains(err.Error(), "Invalid log level") {
					t.Errorf("Expected error message to contain 'Invalid log level', got %q", err.Error())
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error for input %q, got %v", test.input, err)
				}
			}

			if level != test.expected {
				t.Errorf("Expected level %v for input %q, got %v", test.expected, test.input, level)
			}
		})
	}
}

func TestLoggingMethods(t *testing.T) {
	// Capture stdout to verify log output
	old := os.Stdout
	read, write, _ := os.Pipe()
	os.Stdout = write

	service := NewLoggerService()

	// Test each logging method
	service.Debug("debug message", "key", "value")
	service.Info("info message", "key", "value")
	service.Warn("warn message", "key", "value")
	service.Error("error message", "key", "value")

	// Restore stdout
	write.Close()
	os.Stdout = old

	var buffer bytes.Buffer
	io.Copy(&buffer, read)
	output := buffer.String()

	// Check that messages appear in output (info, warn, error should be visible with default level)
	if !strings.Contains(output, "info message") {
		t.Error("Expected info message to appear in output")
	}
	if !strings.Contains(output, "warn message") {
		t.Error("Expected warn message to appear in output")
	}
	if !strings.Contains(output, "error message") {
		t.Error("Expected error message to appear in output")
	}
	if !strings.Contains(output, "key=value") {
		t.Error("Expected key-value pairs to appear in output")
	}
}

func TestStart(t *testing.T) {
	// Capture stdout to verify start message
	old := os.Stdout
	read, write, _ := os.Pipe()
	os.Stdout = write

	service := NewLoggerService()
	service.Start("test-service", "1.0.0")

	// Restore stdout
	write.Close()
	os.Stdout = old

	var buffer bytes.Buffer
	io.Copy(&buffer, read)
	output := buffer.String()

	// Check that the service info appears
	if !strings.Contains(output, "test-service") {
		t.Error("Expected service name to appear in start output")
	}
	if !strings.Contains(output, "1.0.0") {
		t.Error("Expected version to appear in start output")
	}
	if !strings.Contains(output, "Started") {
		t.Error("Expected 'Started' message to appear in start output")
	}
}

func TestDebugLevelVisibility(t *testing.T) {
	// Capture stdout
	old := os.Stdout
	read, write, _ := os.Pipe()
	os.Stdout = write

	service := NewLoggerService()
	service.SetLevel("debug")
	service.Debug("debug message should be visible")

	// Restore stdout
	write.Close()
	os.Stdout = old

	var buffer bytes.Buffer
	io.Copy(&buffer, read)
	output := buffer.String()

	// With debug level set, debug messages should be visible
	if !strings.Contains(output, "debug message should be visible") {
		t.Error("Expected debug message to be visible when debug level is set")
	}
}

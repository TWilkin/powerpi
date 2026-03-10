TARGET_DIR=$(CURDIR)/bin

VERSION=2.0.0-rc.1

.PHONY: all build compile test coverage clean

all: build

compile:
	mkdir -p $(TARGET_DIR)
	env GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=0 go build -tags netgo -ldflags '-extldflags "-static" -s -w -X main.Version=v$(VERSION)' -o $(TARGET_DIR)/powerpi_config_server

build:
	go build ./...

test:
	go test ./...

coverage:
	go test -coverprofile=powerpi_config_server.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)
	
TARGET_DIR=$(CURDIR)/bin
BINARY=$(TARGET_DIR)/powerpi_config_server
VERSION_FLAG=-X main.Version=v$(VERSION)

VERSION=2.0.0-rc.7

.PHONY: all build compile test coverage clean

all: build

compile:
	mkdir -p $(TARGET_DIR)
	env GOOS=$(GOOS) GOARCH=$(GOARCH) CGO_ENABLED=0 go build -tags netgo -ldflags '-extldflags "-static" -s -w $(VERSION_FLAG)' -o $(BINARY)

build:
	mkdir -p $(TARGET_DIR)
	go build -ldflags '$(VERSION_FLAG)' -o $(BINARY) .

test:
	go test ./...

coverage:
	go test -coverprofile=powerpi_config_server.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)
	
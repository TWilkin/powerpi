TARGET_DIR=$(CURDIR)/bin
BINARY=$(TARGET_DIR)/powerpi_shutdown
VERSION_FLAG=-X main.Version=v$(VERSION)

# the OS to build for, currently only Linux is supported
TARGET_OS?=linux

# the architecture to build for, amd64, 386, arm64, arm
TARGET_ARCH?=arm64

# the version of the shutdown service
VERSION=0.2.2-rc.1

.PHONY: all build compile test coverage clean

all: build

compile:
	mkdir -p $(TARGET_DIR)
	env GOOS=$(GOOS) GOARCH=$(GOARCH) go build -ldflags '-s -w $(VERSION_FLAG)' -o $(BINARY)

build:
	mkdir -p $(TARGET_DIR)
	go build -ldflags '$(VERSION_FLAG)' -o $(BINARY) .

test:
	go test ./...

coverage:
	go test -coverprofile=powerpi_energy_monitor.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)

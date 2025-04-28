TARGET_DIR=$(CURDIR)/bin

# the OS to build for, currently only Linux is supported
TARGET_OS?=linux

# the architecture to build for, amd64, 386, arm64, arm
TARGET_ARCH?=arm64

# the version of the shutdown service
VERSION=0.2.0

LIBRARY_SOURCES := $(shell find ../../common/go -name "*.go") 
SOURCES := $(shell find ./ -name "*.go") 

all: compile

$(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH): $(LIBRARY_SOURCES) $(SOURCES)
	mkdir -p $(TARGET_DIR)
	env GOOS=$(TARGET_OS) GOARCH=$(TARGET_ARCH) go build -ldflags="-X 'main.Version=v$(VERSION)'" -o $@

compile: $(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH)

test: $(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH)
	go test ./...

coverage: $(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH)
	go test -coverprofile=powerpi_shutdown.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)

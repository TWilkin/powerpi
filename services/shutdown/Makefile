TARGET_DIR=$(CURDIR)/bin

# the OS to build for, currently only Linux is supported
TARGET_OS?=linux

# the architecture to build for, amd64, 386, arm64, arm
TARGET_ARCH?=arm64

# the version of the shutdown service
VERSION=0.1.0

all: compile

$(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH): src/main.go
	mkdir -p $(TARGET_DIR)
	cd src; env GOOS=$(TARGET_OS) GOARCH=$(TARGET_ARCH) go build -o $(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH) -ldflags="-X 'main.Version=v$(VERSION)'"

compile: $(TARGET_DIR)/powerpi_shutdown_$(TARGET_OS)_$(TARGET_ARCH)

clean:
	rm -r $(TARGET_DIR)

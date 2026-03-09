TARGET_DIR=$(CURDIR)/bin

# the version of the config-server service
VERSION=2.0.0-rc.1

LIBRARY_SOURCES := $(shell find ../../common/go -name "*.go") 
SOURCES := $(shell find ./ -name "*.go") 

all: compile

$(TARGET_DIR)/powerpi_config_server: $(LIBRARY_SOURCES) $(SOURCES)
	mkdir -p $(TARGET_DIR)
	env GOOS=$(GOOS) GOARCH=$(GOARCH) go build -tags netgo -ldflags '-extldflags "-static"' -ldflags="-X 'main.Version=v$(VERSION)'" -o $@

compile: $(TARGET_DIR)/powerpi_config_server

test: $(TARGET_DIR)/powerpi_config_server
	go test ./...

coverage: $(TARGET_DIR)/powerpi_config_server
	go test -coverprofile=powerpi_config_server.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)

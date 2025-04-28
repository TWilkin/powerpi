TARGET_DIR=$(CURDIR)/bin

# the version of the energy-monitor service
VERSION=2.0.0

LIBRARY_SOURCES := $(shell find ../../common/go -name "*.go") 
SOURCES := $(shell find ./ -name "*.go") 

all: compile

$(TARGET_DIR)/powerpi_energy_monitor: $(LIBRARY_SOURCES) $(SOURCES)
	mkdir -p $(TARGET_DIR)
	go build -tags netgo -ldflags '-extldflags "-static"' -ldflags="-X 'main.Version=v$(VERSION)'" -o $@

compile: $(TARGET_DIR)/powerpi_energy_monitor

test: $(TARGET_DIR)/powerpi_energy_monitor
	go test ./...

coverage: $(TARGET_DIR)/powerpi_energy_monitor
	go test -coverprofile=powerpi_energy_monitor.coverage ./...

clean:
	go clean
	rm -r $(TARGET_DIR)

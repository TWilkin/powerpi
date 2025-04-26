SOURCES := $(shell find . -name "*.go" -not -path "./bin/*")

all: compile test

compile: $(SOURCES)
	go build ./...

test:
	go test ./...

coverage:
	go test -coverprofile=powerpi_common.coverage ./...

clean:
	go clean

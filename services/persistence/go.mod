module github.com/TWilkin/powerpi/persistence

go 1.26.0

require (
	github.com/TWilkin/powerpi/common v0.0.0
	github.com/lib/pq v1.12.3
	github.com/spf13/pflag v1.0.6
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/eclipse/paho.mqtt.golang v1.5.1 // indirect
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/stretchr/objx v0.5.2 // indirect
	github.com/stretchr/testify v1.10.0 // indirect
	go.uber.org/dig v1.18.1 // indirect
	golang.org/x/net v0.61.0 // indirect
	golang.org/x/sync v0.24.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace github.com/TWilkin/powerpi/common => ../../common/go

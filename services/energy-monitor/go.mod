module powerpi/energy-monitor

go 1.24.1

require (
	github.com/spf13/pflag v1.0.6
	github.com/stretchr/testify v1.10.0
	powerpi/common v0.0.0
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/eclipse/paho.mqtt.golang v1.5.0 // indirect
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/stretchr/objx v0.5.2 // indirect
	go.uber.org/dig v1.18.1 // indirect
	golang.org/x/net v0.38.0 // indirect
	golang.org/x/sync v0.7.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace powerpi/common => ../../common/go

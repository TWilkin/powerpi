module powerpi/shutdown

go 1.18

require github.com/eclipse/paho.mqtt.golang v1.4.3

require (
	github.com/gorilla/websocket v1.5.0 // indirect
	golang.org/x/net v0.17.0 // indirect
	golang.org/x/sync v0.4.0 // indirect
)

replace github.com/gorilla/websocket => github.com/gorilla/websocket v1.5.0

replace golang.org/x/net => golang.org/x/net v0.17.0

replace golang.org/x/sync => golang.org/x/sync v0.4.0

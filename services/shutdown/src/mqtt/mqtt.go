package mqtt

import (
	"encoding/json"
	"fmt"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"

	"powerpi/shutdown/additional"
)

type DeviceState string
const (
	On DeviceState = "on"
	Off = "off"
)


type MqttMessageAction func(MqttClient, DeviceState, additional.AdditionalState)

type MqttClient struct {
	client MQTT.Client
	hostname string
	topicBase string
	action MqttMessageAction
}

type DeviceMessage struct {
	State DeviceState `json:"state"`
	Brightness *int `json:"brightness"`
	Timestamp int64 `json:"timestamp"`
}

type CapabilityMessage struct {
	Brightness bool `json:"brightness"`
}

func New(hostname string, topicBase string, action MqttMessageAction) MqttClient {
	client := MqttClient{nil, hostname, topicBase, action}
	return client
}

func (client MqttClient) Connect(host string, port int, user *string, password *string, device additional.AdditionalStateDevice) {
	protocol := "tcp"
	if port == 8883 {
		protocol = "tcps"
	}

	address := fmt.Sprintf("%s://%s:%d", protocol, host, port)
	clientId := fmt.Sprintf("shutdown-%s", client.hostname)

	options := MQTT.NewClientOptions()
	options.AddBroker(address)
	options.SetClientID(clientId)
	options.SetCleanSession(true)

	if user != nil && password != nil {
		options.SetUsername(*user)
		options.SetPassword(*password)
	} else {
		user = nil
	}

	options.OnConnect = func(_ MQTT.Client) {
		client.onConnect(device)
	}

	logUser := "anonymous"
	if user != nil {
		logUser = *user
	}
	fmt.Printf("Connecting to MQTT at %s as %s\n", address, logUser)
	client.client = MQTT.NewClient(options)

	if token := client.client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func (client MqttClient) PublishState(state DeviceState, additionalState additional.AdditionalState) {
	topic := client.topic("status")

	message := &DeviceMessage{state, additionalState.Brightness, time.Now().Unix() * 1000}

	payload, err := json.Marshal(message)
	if err != nil {
		fmt.Println("Could not encode JSON message")
		return
	}

	fmt.Printf("Publishing %s: %s\n", topic, payload)

	client.client.Publish(topic, 2, true, payload)
}

func (client MqttClient) PublishCapability(device additional.AdditionalStateDevice) {
	if device.Brightness != nil && len(*device.Brightness) > 0 {
		topic := client.topic("capability")

		message := &CapabilityMessage{true}

		payload, err := json.Marshal(message)
		if err != nil {
			fmt.Println("Could not encode JSON message")
			return
		}

		fmt.Printf("Publishing %s: %s\n", topic, payload)

		client.client.Publish(topic, 2, true, payload)
	}
}

func (client MqttClient) topic(action string) string {
	return fmt.Sprintf("%s/device/%s/%s", client.topicBase, client.hostname, action)
}


func (client MqttClient) onConnect(device additional.AdditionalStateDevice) {
	fmt.Println("Connected to MQTT")

	// publish that this device is now on
	client.PublishState(On, additional.GetAdditionalState(device))
	client.PublishCapability(device)

	// subscribe to the shutdown event for this device
	topic := client.topic("change")
	fmt.Printf("Subscribing to %s\n", topic)

	callback := func(_ MQTT.Client, message MQTT.Message) {
		client.onMessageReceived(message)
	}

	if token := client.client.Subscribe(topic, 2, callback); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func (client MqttClient) onMessageReceived(message MQTT.Message) {
	fmt.Printf("Received %s: %s\n", message.Topic(), message.Payload())

	data := []byte(message.Payload())
	var payload DeviceMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		fmt.Println("Could not decode JSON message")
		return
	}

	// check if the message is old
	twoMinsAgo := time.Now().Unix() - 2 * 60
	if twoMinsAgo >= (payload.Timestamp / 1000) {
		fmt.Println("Ignoring old message")
		return
	}

	// retrieve any supported additional state
	var additionalState additional.AdditionalState
	additionalState.Brightness = payload.Brightness

	// call the action
	client.action(client, payload.State, additionalState)
}

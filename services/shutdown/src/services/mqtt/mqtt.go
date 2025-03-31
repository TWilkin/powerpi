package mqtt

import (
	"encoding/json"
	"fmt"

	MQTT "github.com/eclipse/paho.mqtt.golang"

	"powerpi/common/models"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/clock"
	"powerpi/shutdown/services/flags"
)

type mqttMessageAction func(IMqttClient, models.DeviceState, additional.AdditionalState)

type IMqttClient interface {
	Connect(string, int, *string, *string, flags.Config)

	PublishState(models.DeviceState, additional.AdditionalState)
}

type mqttClient struct {
	factory         MqttClientFactory
	client          MQTT.Client
	hostname        string
	topicBase       string
	action          mqttMessageAction
	additionalState additional.AdditionalStateService
	clock           clock.Clock
}

type deviceMessage struct {
	State      models.DeviceState `json:"state"`
	Brightness *int               `json:"brightness"`
	Timestamp  int64              `json:"timestamp"`
}

type capabilityMessage struct {
	Brightness bool  `json:"brightness"`
	Timestamp  int64 `json:"timestamp"`
}

func newClient(
	config flags.MqttConfig,
	factory MqttClientFactory,
	additionalState additional.AdditionalStateService,
	clock clock.Clock,
	hostname string,
	action mqttMessageAction,
) mqttClient {
	client := mqttClient{factory, nil, hostname, config.TopicBase, action, additionalState, clock}
	return client
}

func (client mqttClient) Connect(
	host string,
	port int,
	user *string,
	password *string,
	config flags.Config,
) {
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
		client.onConnect(config)
	}

	logUser := "anonymous"
	if user != nil {
		logUser = *user
	}
	fmt.Printf("Connecting to MQTT at %s as %s\n", address, logUser)
	client.client = client.factory.BuildClient(options)

	if token := client.client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func (client mqttClient) publish(topic string, message interface{}) {
	payload, err := json.Marshal(message)
	if err != nil {
		fmt.Println("Could not encode JSON message")
		return
	}

	fmt.Printf("Publishing %s: %s\n", topic, payload)

	client.client.Publish(topic, 2, true, payload)
}

func (client mqttClient) PublishState(
	state models.DeviceState,
	additionalState additional.AdditionalState,
) {
	topic := client.topic("status")

	message := &deviceMessage{state, additionalState.Brightness, client.clock.Now().Unix() * 1000}

	client.publish(topic, message)
}

func (client mqttClient) publishCapability(config flags.AdditionalStateConfig) {
	if len(config.Brightness.Device) > 0 {
		topic := client.topic("capability")

		message := &capabilityMessage{true, client.clock.Now().Unix() * 1000}

		client.publish(topic, message)
	}
}

func (client mqttClient) topic(action string) string {
	return fmt.Sprintf("%s/device/%s/%s", client.topicBase, client.hostname, action)
}

func (client mqttClient) onConnect(config flags.Config) {
	fmt.Println("Connected to MQTT")

	// publish that this device is now on
	client.PublishState(models.On, client.additionalState.GetAdditionalState())
	client.publishCapability(config.AdditionalState)

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

func (client mqttClient) onMessageReceived(message MQTT.Message) {
	data := []byte(message.Payload())
	fmt.Printf("Received %s: %s\n", message.Topic(), data)

	var payload deviceMessage
	err := json.Unmarshal(data, &payload)
	if err != nil {
		fmt.Println("Could not decode JSON message")
		return
	}

	// check if the message is old
	twoMinsAgo := client.clock.Now().Unix() - 2*60
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

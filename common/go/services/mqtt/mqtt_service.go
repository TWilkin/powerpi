package mqtt

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"powerpi/common/config"
	"powerpi/common/services/clock"
)

type Message struct {
	Timestamp int64 `json:"timestamp"`
}

type MqttService interface {
	Connect(string, int, *string, *string)
	Join()

	Publish(typ string, entity string, action string, message Message)
	Subscribe(typ string, entity string, action string, newMessage func() Message, channel chan<- Message)
}

type mqttService struct {
	// services
	factory MqttClientFactory
	clock   clock.ClockService

	// state
	client         mqtt.Client
	topicBase      string
	commandChannel chan os.Signal
}

func NewMqttService(config config.MqttConfig, factory MqttClientFactory, clock clock.ClockService) *mqttService {
	service := &mqttService{factory, clock, nil, config.TopicBase, make(chan os.Signal, 1)}

	signal.Notify(service.commandChannel, os.Interrupt, syscall.SIGTERM)

	go service.process()

	return service
}

func (client mqttService) Connect(
	host string,
	port int,
	user *string,
	password *string,
	clientIdPrefix string,
) {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	protocol := "tcp"
	if port == 8883 {
		protocol = "tcps"
	}

	address := fmt.Sprintf("%s://%s:%d", protocol, host, port)
	clientId := fmt.Sprintf("%s-%s", clientIdPrefix, hostname)

	options := mqtt.NewClientOptions()
	options.AddBroker(address)
	options.SetClientID(clientId)
	options.SetCleanSession(true)

	if user != nil && password != nil {
		options.SetUsername(*user)
		options.SetPassword(*password)
	} else {
		user = nil
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

func (service mqttService) Join() {
	<-service.commandChannel
}

func (service mqttService) Publish(typ string, entity string, action string, message Message) {
	topic := service.topic(typ, entity, action)

	// if the message has no timestamp, set it to now
	if message.Timestamp == 0 {
		message.Timestamp = service.clock.Now().Unix() * 1000
	}

	payload, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("Could not encode JSON message: %s\n", err)
		return
	}

	fmt.Printf("Publishing %s: %s\n", topic, payload)
	token := service.client.Publish(topic, 2, true, payload)

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

func (service mqttService) Subscribe(typ string, entity string, action string, newMessage func() Message, channel chan<- Message) {
	topic := service.topic(typ, entity, action)

	token := service.client.Subscribe(topic, 2, func(_ mqtt.Client, message mqtt.Message) {
		data := []byte(message.Payload())
		fmt.Printf("Received %s: %s\n", message.Topic(), data)

		payload := newMessage()

		if err := json.Unmarshal(data, &payload); err != nil {
			fmt.Printf("Could not decode JSON message: %s\n", err)
			return
		}

		// check if the message is old
		twoMinsAgo := service.clock.Now().Unix() - 2*60
		if twoMinsAgo >= (payload.Timestamp / 1000) {
			fmt.Println("Ignoring old message")
			return
		}

		channel <- payload
	})

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

func (service mqttService) process() {
	for {
		select {
		case <-service.commandChannel:
			fmt.Println("Received shutdown signal, disconnecting from MQTT")
			service.client.Disconnect(1000)
			fmt.Println("Disconnected from MQTT")

			close(service.commandChannel)
			return
		}
	}
}

func (service mqttService) topic(typ string, entity string, action string) string {
	return fmt.Sprintf("%s/%s/%s/%s", service.topicBase, typ, entity, action)
}

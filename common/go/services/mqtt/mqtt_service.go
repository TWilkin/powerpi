package mqtt

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"powerpi/common/services/clock"
	configService "powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/common/utils"
)

type MqttService interface {
	Connect(clientIdPrefix string)
	Join()
	Unsubscribe(typ string, entity string, action string)

	topic(typ string, entity string, action string) string

	getClock() clock.ClockService
	getLogger() logger.LoggerService
	getClient() mqtt.Client
}

type mqttService struct {
	// services
	factory MqttClientFactory
	config  configService.ConfigService
	clock   clock.ClockService
	logger  logger.LoggerService

	// state
	client         mqtt.Client
	commandChannel chan os.Signal
}

func NewMqttService(config configService.ConfigService, factory MqttClientFactory, clock clock.ClockService, logger logger.LoggerService) MqttService {
	service := &mqttService{factory, config, clock, logger, nil, make(chan os.Signal, 1)}

	signal.Notify(service.commandChannel, os.Interrupt, syscall.SIGTERM)

	go service.process()

	return service
}

func (service *mqttService) Connect(clientIdPrefix string) {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	config := service.config.MqttConfig()

	protocol := "tcp"
	if config.Port == 8883 {
		protocol = "tcps"
	}

	address := fmt.Sprintf("%s://%s:%d", protocol, config.Host, config.Port)
	clientId := fmt.Sprintf("%s-%s", clientIdPrefix, hostname)

	options := mqtt.NewClientOptions()
	options.AddBroker(address)
	options.SetClientID(clientId)
	options.SetCleanSession(true)

	user := utils.ToPtr(strings.Trim(config.User, " "))
	password := service.config.GetMqttPassword()
	if user != nil && *user != "" && password != nil {
		options.SetUsername(*user)
		options.SetPassword(*password)
	} else {
		user = nil
	}

	logUser := "anonymous"
	if user != nil {
		logUser = *user
	}
	service.logger.Info("Connecting to MQTT", "host", address, "user", logUser)
	service.client = service.factory.BuildClient(options)

	token := service.client.Connect()

	token.Wait()
	if token.Error() != nil {
		panic(token.Error())
	}

	service.logger.Info("Connected to MQTT")
}

func (service mqttService) Join() {
	<-service.commandChannel
}

func (service mqttService) Unsubscribe(typ string, entity string, action string) {
	topic := service.topic(typ, entity, action)
	service.logger.Info("Unsubscribing from", "topic", topic)

	token := service.client.Unsubscribe(topic)
	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

func (service mqttService) process() {
	for {
		select {
		case <-service.commandChannel:
			service.logger.Info("Received shutdown signal, disconnecting from MQTT")
			service.client.Disconnect(1000)
			service.logger.Info("Disconnected from MQTT")

			close(service.commandChannel)
			return
		}
	}
}

func (service mqttService) topic(typ string, entity string, action string) string {
	return fmt.Sprintf("%s/%s/%s/%s", service.config.MqttConfig().TopicBase, typ, entity, action)
}

func (service mqttService) getClock() clock.ClockService {
	return service.clock
}

func (service mqttService) getLogger() logger.LoggerService {
	return service.logger
}

func (service mqttService) getClient() mqtt.Client {
	return service.client
}

func Publish[TMessage mqttMessage](service MqttService, typ string, entity string, action string, message TMessage) {
	topic := service.topic(typ, entity, action)

	// if the message has no timestamp, set it to now
	if message.GetTimestamp() == 0 {
		message.SetTimestamp(service.getClock().Now().Unix() * 1000)
	}

	payload, err := json.Marshal(message)
	if err != nil {
		service.getLogger().Warn("Could not encode JSON message", "error", err)
		return
	}

	service.getLogger().Info("Publishing", "topic", topic, "payload", string(payload))
	token := service.getClient().Publish(topic, 2, true, payload)

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

func Subscribe[TMessage mqttMessage](service MqttService, typ string, entity string, action string, allowOld bool, channel chan<- TMessage) {
	topic := service.topic(typ, entity, action)
	service.getLogger().Info("Subscribing to", "topic", topic)

	token := service.getClient().Subscribe(topic, 2, func(_ mqtt.Client, message mqtt.Message) {
		data := []byte(message.Payload())
		service.getLogger().Info("Received", "topic", message.Topic())

		payload := *new(TMessage)

		if err := json.Unmarshal(data, &payload); err != nil {
			service.getLogger().Warn("Could not decode JSON message", "error", err)
			return
		}

		service.getLogger().Debug("Decoded message", "payload", payload)

		// check if the message is old
		twoMinsAgo := service.getClock().Now().Unix() - 2*60
		if !allowOld && twoMinsAgo >= (payload.GetTimestamp()/1000) {
			service.getLogger().Info("Ignoring old message")
			return
		}

		channel <- payload
	})

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

package mqtt

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"powerpi/common/models"
	"powerpi/common/services/clock"
	configService "powerpi/common/services/config"
	"powerpi/common/services/logger"
	"powerpi/common/utils"
)

type MqttService interface {
	Connect(clientIdPrefix string)
	Join()

	PublishDeviceState(device string, state models.DeviceState, additionalState *models.AdditionalState)
	PublishCapability(device string, capability models.Capability)

	SubscribeDeviceChange(device string, channel chan<- *DeviceMessage)
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

func (service mqttService) PublishDeviceState(device string, state models.DeviceState, additionalState *models.AdditionalState) {
	if additionalState == nil {
		additionalState = &models.AdditionalState{}
	}

	message := DeviceMessage{
		State:           state,
		AdditionalState: *additionalState,
	}

	publish(service, "device", device, "status", &message)
}

func (service mqttService) PublishCapability(device string, capability models.Capability) {
	if capability.Brightness {

		message := CapabilityMessage{
			Capability: capability,
		}

		publish(service, "device", device, "capability", &message)
	}
}

func (service mqttService) SubscribeDeviceChange(device string, channel chan<- *DeviceMessage) {
	subscribe(service, "device", device, "change", channel)
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

func publish[TMessage mqttMessage](service mqttService, typ string, entity string, action string, message TMessage) {
	topic := service.topic(typ, entity, action)

	// if the message has no timestamp, set it to now
	if message.GetTimestamp() == 0 {
		message.SetTimestamp(service.clock.Now().Unix() * 1000)
	}

	payload, err := json.Marshal(message)
	if err != nil {
		service.logger.Warn("Could not encode JSON message", "error", err)
		return
	}

	service.logger.Info("Publishing", "topic", topic, "payload", payload)
	token := service.client.Publish(topic, 2, true, payload)

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

func subscribe[TMessage mqttMessage](service mqttService, typ string, entity string, action string, channel chan<- TMessage) {
	topic := service.topic(typ, entity, action)
	service.logger.Info("Subscribing to", "topic", topic)

	token := service.client.Subscribe(topic, 2, func(_ mqtt.Client, message mqtt.Message) {
		data := []byte(message.Payload())
		service.logger.Info("Received", "topic", message.Topic(), "payload", data)

		payload := *new(TMessage)

		if err := json.Unmarshal(data, &payload); err != nil {
			service.logger.Warn("Could not decode JSON message", "error", err)
			return
		}

		// check if the message is old
		twoMinsAgo := service.clock.Now().Unix() - 2*60
		if twoMinsAgo >= (payload.GetTimestamp() / 1000) {
			service.logger.Info("Ignoring old message")
			return
		}

		channel <- payload
	})

	token.Wait()

	if token.Error() != nil {
		panic(token.Error())
	}
}

package messagequeue

import (
	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/mqtt"
)

type DeviceMessage struct {
	mqtt.BaseMqttMessage
	models.AdditionalState

	State models.DeviceState `json:"state"`
}

type CapabilityMessage struct {
	mqtt.BaseMqttMessage
	models.Capability
}

type DeviceMessageSubscriber interface {
	SubscribeChange(device string, channel chan<- *DeviceMessage)
	UnsubscribeChange(device string)
}

type DeviceMessagePublisher interface {
	PublishState(device string, state models.DeviceState, additionalState *models.AdditionalState)
	PublishCapability(device string, capability models.Capability)
}

type DeviceMessageService interface {
	DeviceMessageSubscriber
	DeviceMessagePublisher
}

type deviceMessageService struct {
	mqttService mqtt.MqttService
}

func NewDeviceMessageService(mqttService mqtt.MqttService) DeviceMessageService {
	return &deviceMessageService{
		mqttService: mqttService,
	}
}

func (service deviceMessageService) SubscribeChange(device string, channel chan<- *DeviceMessage) {
	mqtt.Subscribe(service.mqttService, string(models.TopicDevice), device, string(models.ActionChange), false, channel)
}

func (service deviceMessageService) UnsubscribeChange(device string) {
	service.mqttService.Unsubscribe(string(models.TopicDevice), device, string(models.ActionChange))
}

func (service deviceMessageService) PublishState(device string, state models.DeviceState, additionalState *models.AdditionalState) {
	if additionalState == nil {
		additionalState = &models.AdditionalState{}
	}

	message := DeviceMessage{
		State:           state,
		AdditionalState: *additionalState,
	}

	mqtt.Publish(service.mqttService, string(models.TopicDevice), device, string(models.ActionStatus), &message)
}

func (service deviceMessageService) PublishCapability(device string, capability models.Capability) {
	if capability.Brightness {

		message := CapabilityMessage{
			Capability: capability,
		}

		mqtt.Publish(service.mqttService, string(models.TopicDevice), device, string(models.ActionCapability), &message)
	}
}

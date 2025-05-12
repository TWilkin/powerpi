package messagequeue

import (
	"powerpi/common/models"
	"powerpi/common/services/mqtt"
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

type DeviceMessageService interface {
	PublishState(device string, state models.DeviceState, additionalState *models.AdditionalState)
	PublishCapability(device string, capability models.Capability)

	SubscribeChange(device string, channel chan<- *DeviceMessage)
}

type deviceMessageService struct {
	mqttService mqtt.MqttService
}

func NewDeviceMessageService(mqttService mqtt.MqttService) DeviceMessageService {
	return &deviceMessageService{
		mqttService: mqttService,
	}
}

func (service deviceMessageService) PublishState(device string, state models.DeviceState, additionalState *models.AdditionalState) {
	if additionalState == nil {
		additionalState = &models.AdditionalState{}
	}

	message := DeviceMessage{
		State:           state,
		AdditionalState: *additionalState,
	}

	mqtt.Publish(service.mqttService, "device", device, "status", &message)
}

func (service deviceMessageService) PublishCapability(device string, capability models.Capability) {
	if capability.Brightness {

		message := CapabilityMessage{
			Capability: capability,
		}

		mqtt.Publish(service.mqttService, "device", device, "capability", &message)
	}
}

func (service deviceMessageService) SubscribeChange(device string, channel chan<- *DeviceMessage) {
	mqtt.Subscribe(service.mqttService, "device", device, "change", false, channel)
}

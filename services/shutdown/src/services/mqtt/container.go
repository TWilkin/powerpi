package mqtt

import (
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/flags"
)

type MqttContainer struct {
	MqttClientFactory func(string, MqttMessageAction) IMqttClient
}

func SetupServices(config flags.MqttConfig, additionalState additional.IAdditionalStateService) MqttContainer {
	factory := MqttClientFactory{}

	return MqttContainer{
		func(hostname string, action MqttMessageAction) IMqttClient {
			return newClient(config, factory, additionalState, hostname, action)
		},
	}
}

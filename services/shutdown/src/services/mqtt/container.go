package mqtt

import (
	"powerpi/common/config"
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/clock"
)

type MqttContainer struct {
	MqttClientFactory func(string, mqttMessageAction) IMqttClient
}

func SetupServices(config config.MqttConfig, additionalState additional.AdditionalStateService, clock clock.Clock) MqttContainer {
	factory := mqttClientFactory{}

	return MqttContainer{
		func(hostname string, action mqttMessageAction) IMqttClient {
			return newClient(config, factory, additionalState, clock, hostname, action)
		},
	}
}

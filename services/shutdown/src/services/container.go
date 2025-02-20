package services

import (
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/services/mqtt"
)

type Container struct {
	Config     flags.Config
	Additional additional.AdditionalContainer
	Mqtt       mqtt.MqttContainer
}

func SetupServices(config flags.Config) Container {
	additionalContainer := additional.SetupServices(config.AdditionalState)

	return Container{
		config,
		additionalContainer,
		mqtt.SetupServices(config.Mqtt, additionalContainer.AdditionalStateService),
	}
}

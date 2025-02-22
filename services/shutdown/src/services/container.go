package services

import (
	"powerpi/shutdown/services/additional"
	"powerpi/shutdown/services/clock"
	"powerpi/shutdown/services/flags"
	"powerpi/shutdown/services/mqtt"
)

type Container struct {
	Config     flags.Config
	Clock      clock.IClock
	Additional additional.AdditionalContainer
	Mqtt       mqtt.MqttContainer
}

func SetupServices(config flags.Config) Container {
	additionalContainer := additional.SetupServices(config.AdditionalState)
	clock := clock.Clock{}

	return Container{
		config,
		clock,
		additionalContainer,
		mqtt.SetupServices(config.Mqtt, additionalContainer.AdditionalStateService, clock),
	}
}

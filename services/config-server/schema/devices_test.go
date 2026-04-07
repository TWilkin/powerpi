package schema

import "github.com/TWilkin/powerpi/common/models"

func init() {
	suites = append(suites, Suite{
		file:       "devices/PowerPiSensor.json",
		configType: models.ConfigTypeDevices,
	})
}

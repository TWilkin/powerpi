package models

type OctopusMeterSensor interface {
	MeterSensor
	GetAccount() string
}

type octopusMeterSensor struct {
	Account string `json:"account"` // Octopus account id for the meter
}

func (sensor *octopusMeterSensor) GetAccount() string {
	return sensor.Account
}

type OctopusElectricityMeterSensor struct {
	ElectricityMeterSensor
	octopusMeterSensor
}

func (sensor *OctopusElectricityMeterSensor) GetName() string {
	return sensor.Name
}

type OctopusGasMeterSensor struct {
	GasMeterSensor
	octopusMeterSensor
}

func (sensor *OctopusGasMeterSensor) GetName() string {
	return sensor.Name
}

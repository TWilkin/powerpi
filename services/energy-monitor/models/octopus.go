package models

type OctopusMeterSensor interface {
	MeterSensor
	GetSerialNumber() string
}

type octopusMeterSensor struct {
	SerialNumber string `json:"serial_number"`
}

func (sensor *octopusMeterSensor) GetSerialNumber() string {
	return sensor.SerialNumber
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

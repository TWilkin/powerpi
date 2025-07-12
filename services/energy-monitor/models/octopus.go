package models

type OctopusMeterSensor interface {
	MeterSensor
	GetSerialNumber() string
	GetGeneration() string
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

func (sensor *OctopusElectricityMeterSensor) GetGeneration() string {
	return ""
}

type OctopusGasMeterSensor struct {
	GasMeterSensor
	octopusMeterSensor
	Generation string `json:"generation"` // SMETS1 or SMETS2
}

func (sensor *OctopusGasMeterSensor) GetName() string {
	return sensor.Name
}

func (sensor *OctopusGasMeterSensor) GetGeneration() string {
	return sensor.Generation
}

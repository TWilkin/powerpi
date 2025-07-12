package models

type OctopusMeterSensor interface {
	MeterSensor
	GetSerialNumber() string
}

type octopusMeterSensor struct {
	SerialNumber string `json:"serial_number"`
	Generation   string `json:"generation"` // SMETS1 or SMETS2
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

func (sensor *OctopusGasMeterSensor) GetGeneration() string {
	return sensor.Generation
}

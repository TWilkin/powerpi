package models

import "powerpi/common/models"

type MeterMetric string

const (
	MeterMetricElectricity MeterMetric = "electricity"
	MeterMetricGas         MeterMetric = "gas"
)

type MeterSensor interface {
	GetName() string
	GetMetrics() map[MeterMetric]models.MetricValue
	GetId() int64
}

type meterSensor struct {
	models.Sensor

	Metrics map[MeterMetric]models.MetricValue `json:"metrics"`
}

func (sensor *meterSensor) GetName() string {
	return sensor.Name
}

func (sensor *meterSensor) GetMetrics() map[MeterMetric]models.MetricValue {
	return sensor.Metrics
}

type ElectricityMeterSensor struct {
	meterSensor
	MPAN int64 `json:"mpan"` // Electricity Meter Point Administration Number
}

func (sensor ElectricityMeterSensor) GetId() int64 {
	return sensor.MPAN
}

type GasMeterSensor struct {
	meterSensor
	MPRN int64 `json:"mprn"` // Gas Meter Point Reference Number
}

func (sensor GasMeterSensor) GetId() int64 {
	return sensor.MPRN
}

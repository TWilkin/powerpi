package models

import "powerpi/common/models"

type MeterMetric string

const (
	MeterMetricElectricity MeterMetric = "electricity"
	MeterMetricGas         MeterMetric = "gas"
)

type MeterSensor struct {
	models.Sensor

	Metrics map[MeterMetric]models.MetricValue `json:"metrics"`
	Account string                             `json:"account"`        // Octopus account id for the meter
	MPAN    string                             `json:"mpan,omitempty"` // Electricity Meter Point Administration Number
	MPRN    string                             `json:"mprn,omitempty"` // Gas Meter Point Reference Number
}

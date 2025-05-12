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
}

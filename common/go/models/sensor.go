package models

type Sensor struct {
	BaseDevice
}

type MetricValue string

const (
	MetricValueRead    MetricValue = "read"
	MetricValueVisible MetricValue = "visible"
	MetricValueNone    MetricValue = "none"
)

package octopus

import "time"

type ConsumptionResponse struct {
	Count   int                 `json:"count"`
	Results []ConsumptionResult `json:"results"`
}

type ConsumptionResult struct {
	Consumption   float64   `json:"consumption"`
	IntervalStart time.Time `json:"interval_start"`
	IntervalEnd   time.Time `json:"interval_end"`
}

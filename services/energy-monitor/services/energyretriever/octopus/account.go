package octopus

type AccountResponse struct {
	Properties []Property `json:"properties"`
}

type Property struct {
	ElectricityMeterPoints []ElectricityMeterPoint `json:"electricity_meter_points"`
	GasMeterPoints         []GasMeterPoint         `json:"gas_meter_points"`
}

type ElectricityMeterPoint struct {
	MPAN         string `json:"mpan"`
	SerialNumber string `json:"serial_number"`
}

type GasMeterPoint struct {
	MPRN         string `json:"mprn"`
	SerialNumber string `json:"serial_number"`
}

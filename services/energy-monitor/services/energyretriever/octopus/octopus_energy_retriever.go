package octopus

import (
	"fmt"
	"net/url"
	"path"

	"powerpi/common/services/logger"
	"powerpi/common/services/mqtt"
	"powerpi/energy-monitor/models"
	energyRetriever "powerpi/energy-monitor/services/energyretriever"
)

type OctopusEnergyRetriever struct {
	*energyRetriever.BaseEnergyRetriever
}

const baseURL = "https://api.octopus.energy/v1"

func NewOctopusEnergyRetriever(mqttService mqtt.MqttService, logger logger.LoggerService, meter models.MeterSensor) *OctopusEnergyRetriever {
	return &OctopusEnergyRetriever{
		BaseEnergyRetriever: &energyRetriever.BaseEnergyRetriever{
			MqttService: mqttService,
			Logger:      logger,
			Meter:       meter,
		},
	}
}

func (retriever *OctopusEnergyRetriever) Read() {
	retriever.Logger.Info("Reading energy data from Octopus meter", "meter", retriever.Meter.Name)

	retriever.readConsumption()
}

func (retriever *OctopusEnergyRetriever) readConsumption() {
	// identify the type of meter
	var meterType string
	_, success := retriever.Meter.Metrics[models.MeterMetricElectricity]
	if success {
		meterType = "electricity"
	} else {
		meterType = "gas"
	}

	// the electricity MPAN or gas MPRN
	meterId := "mpan-or-mprn"
	serialNumber := "sn"

	url, err := retriever.generateURL(
		[]string{fmt.Sprintf("%s-meter-points", meterType), meterId, "meters", serialNumber, "consumption"},
		map[string]string{
			"page_size":   "100",
			"period_from": "2025-07-01T00:00:00",
			"period_to":   "2025-07-02T00:00:00",
		},
	)
	if err != nil {
		retriever.Logger.Error("Failed to generate URL for consumption data", "error", err)
		return
	}

	retriever.Logger.Info("Generated URL for consumption data", "url", url)
}

// TODO put this in a helper in common
func (retriever *OctopusEnergyRetriever) generateURL(paths []string, params map[string]string) (string, error) {
	url, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	url.Path = path.Join(append([]string{url.Path}, paths...)...)

	query := url.Query()
	for key, value := range params {
		query.Set(key, value)
	}
	url.RawQuery = query.Encode()

	return url.String(), nil
}

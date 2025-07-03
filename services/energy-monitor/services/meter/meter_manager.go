package meter

import (
	"encoding/json"
	commonModels "powerpi/common/models"
	"powerpi/common/services/logger"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
	energyRetrieverFactory "powerpi/energy-monitor/services/energyretriever/energyretrieverfactory"
)

type MeterManager interface {
	Start()
}

type meterManager struct {
	configService config.ConfigService
	logger        logger.LoggerService
	factory       energyRetrieverFactory.EnergyRetrieverFactory

	meters []models.MeterSensor
}

func NewMeterManager(configService config.ConfigService, logger logger.LoggerService, factory energyRetrieverFactory.EnergyRetrieverFactory) MeterManager {
	return &meterManager{
		configService: configService,
		logger:        logger,
		factory:       factory,
		meters:        make([]models.MeterSensor, 0),
	}
}

func (manager *meterManager) Start() {
	config := manager.configService.GetConfig(commonModels.ConfigTypeDevices)

	sensors := config.Data["sensors"]
	if sensorsList, ok := sensors.([]interface{}); ok {
		for _, sensor := range sensorsList {
			if sensorMap, ok := sensor.(map[string]interface{}); ok {
				if sensorType, ok := sensorMap["type"].(string); ok && sensorType == "meter" {
					manager.logger.Info("Found meter sensor", "sensor", sensorMap["name"])

					meter := manager.readSensor(sensorMap)

					if meter != nil {
						manager.meters = append(manager.meters, *meter)
					}
				}
			}
		}

		manager.logger.Info("Found meter sensor(s)", "count", len(manager.meters))
	} else {
		manager.logger.Error("Expected sensors to be a list", "sensors", sensors)
	}

	// Initialise energy retrievers for each meter
	for _, meter := range manager.meters {
		retriever := manager.factory.BuildRetriever(meter)
		if retriever != nil {
			retriever.Read()
		} else {
			manager.logger.Error("Failed to create energy retriever for meter", "meter", meter.Name)
		}
	}
}

func (manager *meterManager) readSensor(sensorMap map[string]interface{}) *models.MeterSensor {
	jsonData, err := json.Marshal(sensorMap)
	if err != nil {
		manager.logger.Error("Failed to marshal sensor data", "error", err)
		return nil
	}

	var meterSensor models.MeterSensor
	err = json.Unmarshal(jsonData, &meterSensor)
	if err != nil {
		manager.logger.Error("Failed to unmarshal sensor data", "error", err)
		return nil
	}

	return &meterSensor
}

package meter

import (
	"encoding/json"
	commonModels "powerpi/common/models"
	"powerpi/common/services/logger"
	"powerpi/energy-monitor/models"
	"powerpi/energy-monitor/services/config"
)

type MeterManager interface {
	Start()
}

type meterManager struct {
	configService config.ConfigService
	logger        logger.LoggerService

	meters []models.MeterSensor
}

func NewMeterManager(configService config.ConfigService, logger logger.LoggerService) MeterManager {
	return &meterManager{
		configService: configService,
		logger:        logger,
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

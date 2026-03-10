package manager

import (
	"context"
	"fmt"
	"powerpi/common/services/logger"
	"powerpi/config-server/services/kubernetes"
)

type ConfigManager interface {
	Start()
}

type configManager struct {
	logger    logger.LoggerService
	configMap kubernetes.ConfigMapService
}

func NewConfigManager(
	logger logger.LoggerService,
	configMap kubernetes.ConfigMapService,
) ConfigManager {
	return &configManager{
		logger:    logger,
		configMap: configMap,
	}
}

func (manager *configManager) Start() {
	ctx := context.Background()

	files := []string{"devices", "events", "floorplan", "schedules", "users"}

	for _, file := range files {
		manager.logger.Info("Checking for config file", file)

		checksum, err := manager.configMap.GetChecksum(ctx, fmt.Sprintf("config-%s", file))
		if err != nil {
			continue
		}

		manager.logger.Info("Comparing checksum", file, checksum)
	}
}

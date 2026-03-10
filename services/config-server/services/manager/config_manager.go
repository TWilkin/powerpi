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
		manager.ProcessFile(ctx, file)
	}
}

func (manager *configManager) ProcessFile(ctx context.Context, file string) {
	manager.logger.Info("Checking for config file", "file", file)

	configName := fmt.Sprintf("config-%s", file)

	// get the current checksum (if any)
	checksum, err := manager.configMap.GetChecksum(ctx, configName)
	if err != nil {
		manager.logger.Error("Unable to retrieve checksum", "file", file, "err", err)
	}

	manager.logger.Info("Read checksum", "file", file, "checksum", *checksum)

	// write the new data and checksum
	fileName := fmt.Sprintf("%s.json", file)
	err = manager.configMap.Write(ctx, configName, fileName, "{}", *checksum)
	if err != nil {
		manager.logger.Error("Failed to write updated ConfigMap", "file", file, "err", err)
	}

	manager.logger.Info("Updated ConfigMap", "file", file)

}

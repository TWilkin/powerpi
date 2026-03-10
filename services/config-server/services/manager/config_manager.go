package manager

import (
	"context"
	"crypto/sha256"
	"fmt"

	"powerpi/common/services/logger"
	"powerpi/config-server/services/config"
	"powerpi/config-server/services/kubernetes"
)

type ConfigManager interface {
	Start()
}

type configManager struct {
	config    config.ConfigService
	logger    logger.LoggerService
	configMap kubernetes.ConfigMapService
}

func NewConfigManager(
	config config.ConfigService,
	logger logger.LoggerService,
	configMap kubernetes.ConfigMapService,
) ConfigManager {
	return &configManager{
		config:    config,
		logger:    logger,
		configMap: configMap,
	}
}

func (manager *configManager) Start() {
	ctx := context.Background()

	files := []string{"devices", "events", "floorplan", "schedules", "users"}

	for _, file := range files {
		if file == "events" && !manager.config.GetFileConfig().Events {
			// ignore the events file when disabled
			continue
		}

		if file == "schedules" && !manager.config.GetFileConfig().Scheduler {
			// ignore the schedules file when disabled
			continue
		}

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

	manager.logger.Info("Read current checksum", "file", file, "checksum", *checksum)

	// TODO read the new file
	content := "{}"
	newChecksum := fmt.Sprintf("%x", sha256.Sum256([]byte(content)))

	manager.logger.Info("Read file from GitHub", "file", file, "checksum", *&newChecksum)

	if *checksum != newChecksum {
		// write the new data and checksum
		fileName := fmt.Sprintf("%s.json", file)
		err = manager.configMap.Write(ctx, configName, fileName, content, newChecksum)
		if err != nil {
			manager.logger.Error("Failed to write updated ConfigMap", "file", file, "err", err)
		}

		manager.logger.Info("Updated ConfigMap", "file", file)
	} else {
		manager.logger.Info("Not updating ConfigMap as file is unchanged", "file", file)
	}

}

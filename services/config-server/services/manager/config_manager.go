package manager

import (
	"context"
	"crypto/sha256"
	"fmt"
	"time"

	"powerpi/common/services/logger"
	"powerpi/config-server/models"
	"powerpi/config-server/services/config"
	"powerpi/config-server/services/converter"
	"powerpi/config-server/services/github"
	"powerpi/config-server/services/kubernetes"
	"powerpi/config-server/services/validator"
)

type ConfigManager interface {
	Start()
}

type configManager struct {
	config    config.ConfigService
	logger    logger.LoggerService
	configMap kubernetes.ConfigMapService
	gitHub    github.GitHubService
	converter converter.ConverterService
	validator validator.ValidatorService
}

func NewConfigManager(
	config config.ConfigService,
	logger logger.LoggerService,
	configMap kubernetes.ConfigMapService,
	gitHub github.GitHubService,
	converter converter.ConverterService,
	validator validator.ValidatorService,
) ConfigManager {
	return &configManager{
		config:    config,
		logger:    logger,
		configMap: configMap,
		gitHub:    gitHub,
		converter: converter,
		validator: validator,
	}
}

func (manager *configManager) Start() {
	ctx := context.Background()

	for _, file := range models.FileTypes {
		if file == "events" && !manager.config.GetFileConfig().Events {
			// ignore the events file when disabled
			continue
		}

		if file == "schedules" && !manager.config.GetFileConfig().Scheduler {
			// ignore the schedules file when disabled
			continue
		}

		manager.processFile(ctx, file)
	}
}

func (manager *configManager) processFile(ctx context.Context, file models.FileType) {
	manager.logger.Info("Checking for config file", "file", file)

	configName := fmt.Sprintf("config-%s", file)

	// get the current checksum (if any)
	checksum, err := manager.configMap.GetChecksum(ctx, configName)
	if err != nil {
		manager.logger.Error("Unable to retrieve checksum", "file", file, "err", err)
	}

	manager.logger.Info("Read current checksum", "file", file, "checksum", *checksum)

	content, err := manager.readConfigFile(ctx, file)
	if err != nil || content == "" {
		// without any content we don't want to continue
		manager.logger.Error("Unable to retrieve file from GitHub", "file", file, "err", err)
		return
	}
	newChecksum := fmt.Sprintf("%x", sha256.Sum256([]byte(content)))

	manager.logger.Info("Read file from GitHub", "file", file, "checksum", *&newChecksum)

	// validate the file
	err = manager.validator.Validate(file, content)
	if err != nil {
		manager.logger.Error("Validation failed", "file", file, "err", err)
		return
	}

	manager.logger.Info("Validation passed", "file", file)

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

func (manager *configManager) readFile(ctx context.Context, fileName string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	manager.logger.Info("Reading file from GitHub", "file", fileName)

	return manager.gitHub.GetFile(ctx, fileName)
}

func (manager *configManager) readConfigFile(ctx context.Context, file models.FileType) (string, error) {
	// first we try YAML
	fileName := fmt.Sprintf("%s.yaml", file)
	content, err := manager.readFile(ctx, fileName)
	if err != nil {
		return content, err
	}

	if content != "" {
		// we have YAML so we need to convert
		manager.logger.Info("Converting YAML to JSON", "file", fileName)

		json, err := manager.converter.YAMLtoJSON(content)
		if err != nil {
			manager.logger.Info("Failed to convert from YAML", "file", fileName)
			return "", err
		}
		return json, nil
	}

	fileName = fmt.Sprintf("%s.json", fileName)
	return manager.readFile(ctx, fileName)

}

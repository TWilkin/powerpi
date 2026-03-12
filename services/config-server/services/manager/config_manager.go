package manager

import (
	"context"
	"crypto/sha256"
	"fmt"
	"os"
	"time"

	"github.com/TWilkin/powerpi/common/models"
	"github.com/TWilkin/powerpi/common/services/logger"
	messageQueue "github.com/TWilkin/powerpi/common/services/mqtt/messagequeue"
	"github.com/TWilkin/powerpi/config-server/services/config"
	"github.com/TWilkin/powerpi/config-server/services/converter"
	"github.com/TWilkin/powerpi/config-server/services/device"
	"github.com/TWilkin/powerpi/config-server/services/github"
	"github.com/TWilkin/powerpi/config-server/services/kubernetes"
	"github.com/TWilkin/powerpi/config-server/services/validator"
)

type ConfigManager interface {
	Start()
}

type configManager struct {
	config        config.ConfigService
	logger        logger.LoggerService
	configMap     kubernetes.ConfigMapService
	gitHub        github.GitHubService
	converter     converter.ConverterService
	validator     validator.ValidatorService
	publisher     messageQueue.ConfigMessagePublisher
	deviceHandler device.DeviceConfigHandler
}

func NewConfigManager(
	config config.ConfigService,
	logger logger.LoggerService,
	configMap kubernetes.ConfigMapService,
	gitHub github.GitHubService,
	converter converter.ConverterService,
	validator validator.ValidatorService,
	publisher messageQueue.ConfigMessagePublisher,
	deviceHandler device.DeviceConfigHandler,
) ConfigManager {
	return &configManager{
		config:        config,
		logger:        logger,
		configMap:     configMap,
		gitHub:        gitHub,
		converter:     converter,
		validator:     validator,
		publisher:     publisher,
		deviceHandler: deviceHandler,
	}
}

func (manager *configManager) Start() {
	ctx := context.Background()

	expectedFiles := 0
	successfulFiles := 0

	for _, file := range models.ConfigTypes {
		expectedFiles++

		if file == models.ConfigTypeEvents && !manager.config.GetFileConfig().Events {
			// ignore the events file when disabled
			continue
		}

		if file == models.ConfigTypeSchedules && !manager.config.GetFileConfig().Scheduler {
			// ignore the schedules file when disabled
			continue
		}

		success := manager.processFile(ctx, file)
		if success {
			successfulFiles++
		}
	}

	// if we had any failed files, we should error to allow a retry
	if successfulFiles < expectedFiles {
		manager.logger.Error("Failed to update config for all files", "success", successfulFiles, "expected", expectedFiles)
		os.Exit(1)
	}
}

func (manager *configManager) processFile(ctx context.Context, file models.ConfigType) bool {
	manager.logger.Info("Checking for config file", "file", file)

	configName := fmt.Sprintf("config-%s", file)

	// get the current checksum (if any)
	checksum, err := manager.readChecksum(ctx, configName)
	if err != nil {
		manager.logger.Error("Unable to retrieve checksum", "file", file, "err", err)
	}

	manager.logger.Info("Read current checksum", "file", file, "checksum", checksum)

	content, err := manager.readConfigFile(ctx, file)
	if err != nil || content == "" {
		// without any content we don't want to continue
		manager.logger.Error("Unable to retrieve file from GitHub", "file", file, "err", err)
		return false
	}
	newChecksum := fmt.Sprintf("%x", sha256.Sum256([]byte(content)))

	manager.logger.Info("Read file from GitHub", "file", file, "checksum", newChecksum)

	// validate the file
	json, err := manager.validator.Validate(file, content)
	if err != nil {
		manager.logger.Error("Validation failed", "file", file, "err", err)

		manager.publisher.PublishError(file, err.Error())

		return true // validation failure is not an error with the service, where a retry would help
	}

	manager.logger.Info("Validation passed", "file", file)

	if checksum != newChecksum {
		// write the new data and checksum
		err = manager.writeConfigMap(ctx, configName, file, content, newChecksum)
		if err != nil {
			manager.logger.Error("Failed to write updated ConfigMap", "configMap", configName, "err", err)
			return false
		}

		manager.logger.Info("Updated ConfigMap", "file", file)
	} else {
		manager.logger.Info("Not updating ConfigMap as file is unchanged", "file", file)
	}

	if file == models.ConfigTypeDevices {
		manager.deviceHandler.Publish(json)
	}

	return true
}

func (manager *configManager) readChecksum(ctx context.Context, configName string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	manager.logger.Info("Reading checksum in ConfigMap", "configMap", configName)

	return manager.configMap.GetChecksum(ctx, configName)
}

func (manager *configManager) writeConfigMap(ctx context.Context, configName string, file models.ConfigType, content string, checksum string) error {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	fileName := fmt.Sprintf("%s.json", file)
	return manager.configMap.Write(ctx, configName, fileName, content, checksum)
}

func (manager *configManager) readFile(ctx context.Context, fileName string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	manager.logger.Info("Reading file from GitHub", "file", fileName)

	return manager.gitHub.GetFile(ctx, fileName)
}

func (manager *configManager) readConfigFile(ctx context.Context, file models.ConfigType) (string, error) {
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

	fileName = fmt.Sprintf("%s.json", file)
	return manager.readFile(ctx, fileName)

}

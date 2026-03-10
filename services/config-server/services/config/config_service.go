package config

import (
	"github.com/spf13/pflag"

	commonConfigService "powerpi/common/services/config"
	"powerpi/common/services/logger"
	config "powerpi/config-server/models"
)

type ConfigService interface {
	commonConfigService.ConfigService

	Parse(args []string)

	GetGitHubConfig() config.GitHubConfig
	GetGitHubToken() *string

	GetKubernetesConfig() config.KubernetesConfig

	GetFileConfig() config.FileConfig
}

type configService struct {
	commonConfigService.ConfigService
	logger logger.LoggerService

	gitHub     config.GitHubConfig
	kubernetes config.KubernetesConfig
	files      config.FileConfig
}

func NewConfigService(logger logger.LoggerService) ConfigService {
	return &configService{
		ConfigService: commonConfigService.NewConfigService(logger),
		logger:        logger,

		gitHub:     config.GitHubConfig{},
		kubernetes: config.KubernetesConfig{},
		files:      config.FileConfig{},
	}
}

func (service *configService) Parse(args []string) {
	flagSet := pflag.NewFlagSet("config-service", pflag.ExitOnError)

	// GitHub flags
	flagSet.StringVar(&service.gitHub.UserId, "github-user", "undefined", "The GitHub user id to authenticate as")
	flagSet.StringVar(&service.gitHub.TokenFile, "github-token", "undefined", "The path to GitHub user token file to authenticate with")
	flagSet.StringVar(&service.gitHub.Repo, "repo", "undefined", "The GitHub repository to read from")
	flagSet.StringVar(&service.gitHub.Branch, "branch", "undefined", "The GitHub repository branch to read from")
	flagSet.StringVar(&service.gitHub.Path, "path", "undefined", "The path within the GitHub repository and branch to read from")

	// Kubernetes flags
	flagSet.StringVar(&service.kubernetes.Namespace, "namespace", "powerpi", "The kubernetes namespace to read/write the ConfigMaps from/to")

	// File type flags
	flagSet.BoolVar(&service.files.Events, "events", true, "Whether the events file is enabled")
	flagSet.BoolVar(&service.files.Scheduler, "scheduler", true, "Whether the scheduler file is enabled")

	service.ConfigService.ParseWithFlags(args, *flagSet)

	service.EnvironmentOverride(flagSet, "github-user", "GITHUB_USER")
	service.EnvironmentOverride(flagSet, "github-token", "GITHUB_SECRET_FILE")
	service.EnvironmentOverride(flagSet, "repo", "REPO")
	service.EnvironmentOverride(flagSet, "branch", "BRANCH")
	service.EnvironmentOverride(flagSet, "path", "FILE_PATH")

	service.EnvironmentOverride(flagSet, "namespace", "NAMESPACE")

	service.EnvironmentOverride(flagSet, "events", "EVENTS_ENABLED")
	service.EnvironmentOverride(flagSet, "scheduler", "SCHEDULER_ENABLED")
}

func (service *configService) GetGitHubConfig() config.GitHubConfig {
	return service.gitHub
}

func (service *configService) GetKubernetesConfig() config.KubernetesConfig {
	return service.kubernetes
}

func (service *configService) GetGitHubToken() *string {
	token, err := service.ReadPasswordFile(service.gitHub.TokenFile)
	if err != nil {
		service.logger.Error("Failed to read GitHub token key file", "error", err)
		panic(err)
	}

	return token
}

func (service *configService) GetFileConfig() config.FileConfig {
	return service.files
}

package github

import (
	"context"
	"fmt"
	"sync"

	"github.com/TWilkin/powerpi/common/services/logger"
	"github.com/TWilkin/powerpi/config-server/services/config"

	gh "github.com/google/go-github/v68/github"
	"golang.org/x/oauth2"
)

type GitHubService interface {
	GetFile(ctx context.Context, fileName string) (string, error)
}

type gitHubService struct {
	config config.ConfigService
	logger logger.LoggerService

	client     *gh.Client
	clientOnce sync.Once
}

func NewGitHubService(configService config.ConfigService, loggerService logger.LoggerService) GitHubService {
	return &gitHubService{
		config: configService,
		logger: loggerService,
	}
}

func (gitHubService *gitHubService) GetFile(ctx context.Context, fileName string) (string, error) {
	client := gitHubService.getClient()

	ghConfig := gitHubService.config.GetGitHubConfig()

	path := fmt.Sprintf("%s/%s", ghConfig.Path, fileName)

	options := &gh.RepositoryContentGetOptions{Ref: ghConfig.Ref}

	file, _, _, err := client.Repositories.GetContents(ctx, ghConfig.UserId, ghConfig.Repo, path, options)
	if err != nil {
		if ghErr, ok := err.(*gh.ErrorResponse); ok && ghErr.Response.StatusCode == 404 {
			gitHubService.logger.Info(
				"File not found",
				"owner", ghConfig.UserId,
				"repo", ghConfig.Repo,
				"ref", ghConfig.Ref,
				"path", path,
			)
			return "", nil
		}

		return "", err
	}

	return file.GetContent()
}

func (gitHubService *gitHubService) getClient() *gh.Client {
	gitHubService.clientOnce.Do(func() {
		tokenSource := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: *gitHubService.config.GetGitHubToken()})
		httpClient := oauth2.NewClient(context.Background(), tokenSource)
		gitHubService.client = gh.NewClient(httpClient)

	})

	return gitHubService.client
}

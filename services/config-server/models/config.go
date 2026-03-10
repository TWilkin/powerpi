package config

type GitHubConfig struct {
	UserId    string
	TokenFile string
	Repo      string
	Ref       string
	Path      string
}

type KubernetesConfig struct {
	Namespace string
}

type FileConfig struct {
	Events    bool
	Scheduler bool
}

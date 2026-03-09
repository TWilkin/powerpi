package config

type GitHubConfig struct {
	UserId    string
	TokenFile string
	Repo      string
	Branch    string
	Path      string
}

type FileConfig struct {
	Events    bool
	Scheduler bool
}

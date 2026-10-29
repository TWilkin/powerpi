package config

type PersistenceConfig struct {
	Host         string
	Port         uint16
	Schema       string
	User         string
	PasswordFile string
}

package config

type MqttConfig struct {
	Host         string
	Port         int
	User         string
	PasswordFile string
	TopicBase    string
}

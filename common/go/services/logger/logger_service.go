package logger

import (
	"log"
	"os"
)

type LoggerService interface {
	Start(service string, version string)
	Info(message string)
}

type loggerService struct {
	logger *log.Logger
}

func NewLoggerService() LoggerService {
	logger := log.New(os.Stdout, "PowerPi ", log.LstdFlags)

	return &loggerService{logger: logger}
}

func (log *loggerService) Start(service string, version string) {
	log.logger.Print(`
__________                         __________.__ 
\\______   \\______  _  __ __________\\______   \\__|
|     ___/  _ \\ \\/ \\/ // __ \\_  __ \\     ___/  |
|    |  (  <_> )     /\\  ___/|  | \\/    |   |  |
|____|   \\____/ \\/\\_/  \\___  >__|  |____|   |__|
                            \\/
	`)
	log.logger.Printf("%s %s\n", service, version)

}

func (log *loggerService) Info(message string) {
	log.logger.Println(message)
}

package mqtt

type IMqttClient interface {
	Connect(string, int, *string, *string)
}

type MqttClient struct {
}

func NewMqttClient() *MqttClient {
	return &MqttClient{}
}

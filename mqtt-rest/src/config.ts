export default class Config {
    get mqttAddress() {
        return process.env['MQTT_ADDRESS'];
    }

    get topicNameBase() {
        return process.env['TOPIC_BASE'];
    }

    get isDebug() {
        return process.env['DEBUG']?.toLowerCase() === 'true';
    }
};
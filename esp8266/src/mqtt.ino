#include "mqtt.h"

void setupMQTT() {
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);

    Serial.print("Using MQTT: ");
    Serial.print(MQTT_SERVER);
    Serial.print(":");
    Serial.println(MQTT_PORT);
}

void connectMQTT(bool waitForNTP) {
    // wait until it's connected
    while(!mqttClient.connected()) {
        if(!mqttClient.connect(HOSTNAME)) {
            Serial.print("MQTT connection failed ");
            Serial.println(mqttClient.state());
            
            delay(500);
        }
    }

    // check NTP update has run
    if(waitForNTP) {
        while(timeClient.getEpochTime() < 24 * 60 * 60 * 1000) {
            Serial.println("Waiting for NTP update");

            delay(500);
        }
    }
}

void publish(char* action, ArduinoJson::JsonDocument& message) {
    // retrieve the timestamp
    unsigned long long timestamp = timeClient.getEpochTime();

    // generate the topic
    char topic[TOPIC_LEN];
    snprintf(topic, TOPIC_LEN, MQTT_TOPIC, LOCATION, action);

    // generate the message
    message["timestamp"] = timestamp * 1000;
    char messageStr[MESSAGE_LEN];
    serializeJson(message, messageStr);

    // publish the message
    connectMQTT(true);
    mqttClient.publish(topic, messageStr, true);
}

#include "mqtt.h"

void setupMQTT() {
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);

    Serial.print("Using MQTT: ");
    Serial.print(MQTT_SERVER);
    Serial.print(":");
    Serial.println(MQTT_PORT);
}

void connectMQTT() {
    // wait until it's connected
    while(!mqttClient.connected()) {
        if(!mqttClient.connect(HOSTNAME)) {
            Serial.print("MQTT connection failed ");
            Serial.println(mqttClient.state());
            
            delay(500);
        }
    }

    // check NTP update has run
    while(timeClient.getEpochTime() < 24 * 60 * 60 * 1000) {
        Serial.println("Waiting for NTP update");

        delay(500);
    }
}

void publish(char* action, char* props) {
    // retrieve the timestamp
    unsigned long timestamp = timeClient.getEpochTime();

    // generate the topic
    char topic[TOPIC_LEN];
    snprintf(topic, TOPIC_LEN, MQTT_TOPIC, LOCATION, action);

    // generate the message
    char message[MESSAGE_LEN];
    snprintf(message, MESSAGE_LEN, MQTT_MESSAGE, timestamp, props);

    // publish the message
    connectMQTT();
    mqttClient.publish(topic, message, true);
}

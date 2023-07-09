#include "mqtt.h"

void setupMQTT() {
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);

    Serial.print("Using MQTT: ");
    Serial.print(MQTT_SERVER);
    Serial.print(":");
    Serial.print(MQTT_PORT);

    #ifdef MQTT_USER
        Serial.print(" as ");
        Serial.print(MQTT_USER);
    #endif

    Serial.println();
}

void connectMQTT(bool waitForNTP) {
    // wait until it's connected
    while(!mqttClient.connected()) {
        #ifdef MQTT_USER
            bool connected = mqttClient.connect(HOSTNAME, MQTT_USER, MQTT_PASSWORD);
        #else
            bool connected = mqttClient.connect(HOSTNAME);
        #endif

        if(!connected) {
            Serial.print("MQTT connection failed ");
            Serial.println(mqttClient.state());
            
            delay(MQTT_ACTION_DELAY);
        }
    }

    // check NTP update has run
    if(waitForNTP) {
        unsigned short retries = 0;

        while(retries < MAX_NTP_RETRIES && timeClient.getEpochTime() < 24 * 60 * 60 * 1000) {
            retries++;

            Serial.println("Waiting for NTP update");

            delay(MQTT_ACTION_DELAY);
        }

        // restart the device if NTP isn't working
        if(retries >= MAX_NTP_RETRIES) {
            ESP.restart();
        }
    }
}

void publish(const char action[], ArduinoJson::JsonDocument& message) {
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

    // wait for a moment if we're planning to deep sleep to ensure it sends
    #ifdef DEEP_SLEEP
        delay(MQTT_ACTION_DELAY);
    #endif
}

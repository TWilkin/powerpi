#include "clacks.h"

void setupClacksConfig() {
    // initialise the clacks config with the default values
    clacksConfig = ClacksConfig_default;

    // generate the topic
    char topic[TOPIC_LEN];
    snprintf(topic, TOPIC_LEN, CLACKS_MQTT_TOPIC, HOSTNAME);

    // subscribe to MQTT
    mqttClient.setCallback(configCallback);
    connectMQTT();
    mqttClient.subscribe(topic);

    // wait for the message
    Serial.println("Waiting for configuration");
    int counter = 0;
    while(!clacksConfig.received) {
        Serial.print(".");

        mqttClient.loop();

        // terminate if we can't get the configuration after 60s
        if(counter++ > 60 * 2) {
            ESP.restart();
        }

        delay(500);
    }
    Serial.println();
}

void configCallback(char* topic, byte* payload, unsigned int length) {
    for(int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }

    // once the configuration is parsed, set the configuration received
    clacksConfig.received = true;
}

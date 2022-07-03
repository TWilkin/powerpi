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
    StaticJsonDocument<64> doc;
    deserializeJson(doc, payload);

    Serial.println();

    #ifdef DHT22_SENSOR
        Serial.println("DHT22:");

        clacksConfig.dht22Skip = doc["payload"]["dht22"]["skip"] | DHT22_SKIP;
        Serial.print("\tSkip: ");
        Serial.println(clacksConfig.dht22Skip);
    #endif

    #ifdef MOTION_SENSOR
        Serial.println("PIR:");
        
        clacksConfig.pirInitDelay = doc["payload"]["pir"]["init_delay"] | PIR_INIT_DELAY;
        Serial.print("\tInit Delay: ");
        Serial.println(clacksConfig.pirInitDelay);

        clacksConfig.pirPostDetectSkip = doc["payload"]["pir"]["post_delay_skip"] | PIR_POST_DETECT_SKIP;
        Serial.print("\tPost Detect Skip: ");
        Serial.println(clacksConfig.pirPostDetectSkip);

        clacksConfig.pirPostMotionSkip = doc["payload"]["pir"]["post_motion_skip"] | PIR_POST_MOTION_SKIP;
        Serial.print("\tPost Motion Skip: ");
        Serial.println(clacksConfig.pirPostMotionSkip);
    #endif

    // once the configuration is parsed, set the configuration received
    clacksConfig.received = true;
}

#include "clacks.h"

void setupClacksConfig() {
    // initialise the clacks config with the default values
    clacksConfig = ClacksConfig_default;

    // if we are using clacks-config
    #ifdef CLACKS_CONFIG
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
    #endif
}

void configCallback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, payload);

    Serial.println();

    clacksConfig.pollDelay = (doc["payload"]["poll_delay"] | POLL_DELAY) * 1000;
    Serial.print("Poll Delay: ");
    Serial.print(clacksConfig.pollDelay);
    Serial.println("ms");

    #ifdef DHT22_SENSOR
        Serial.println("DHT22:");

        clacksConfig.dht22Skip = secondsToInterval(doc["payload"]["dht22"]["skip"] | DHT22_SKIP);
        Serial.print("\tSkip: ");
        Serial.print(clacksConfig.dht22Skip);
        Serial.println(" intervals");
    #endif

    #ifdef MOTION_SENSOR
        Serial.println("PIR:");
        
        clacksConfig.pirInitDelay = (doc["payload"]["pir"]["init_delay"] | PIR_INIT_DELAY) * 1000;
        Serial.print("\tInit Delay: ");
        Serial.print(clacksConfig.pirInitDelay);
        Serial.println("ms");

        clacksConfig.pirPostDetectSkip = secondsToInterval(doc["payload"]["pir"]["post_delay_skip"] | PIR_POST_DETECT_SKIP);
        Serial.print("\tPost Detect Skip: ");
        Serial.print(clacksConfig.pirPostDetectSkip);
        Serial.println(" intervals");

        clacksConfig.pirPostMotionSkip = secondsToInterval(doc["payload"]["pir"]["post_motion_skip"] | PIR_POST_MOTION_SKIP);
        Serial.print("\tPost Motion Skip: ");
        Serial.print(clacksConfig.pirPostMotionSkip);
        Serial.println(" intervals");
    #endif

    // once the configuration is parsed, set the configuration received
    clacksConfig.received = true;
}

unsigned short secondsToInterval(unsigned int seconds) {
    float intervalsPerSecond = 1000 / clacksConfig.pollDelay;

    unsigned short intervals = ((float)seconds) * intervalsPerSecond;

    if(intervals < 1) {
        intervals = 1;
    }

    return intervals;
}

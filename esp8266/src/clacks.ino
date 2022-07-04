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
        connectMQTT(false);
        mqttClient.subscribe(topic);

        // wait for the message
        Serial.println("Waiting for configuration");
        int counter = 0;
        while(!clacksConfig.received) {
            Serial.print(".");

            mqttClient.loop();

            // terminate if we can't get the configuration after 60s
            if(++counter >= CONFIG_WAIT) {
                Serial.println("No configuration received, giving up...");
                useDefaultConfig();
                return;
            }

            delay(500);
        }
        Serial.println();
    #else
        useDefaultConfig();
    #endif
}

void useDefaultConfig() {
    // we have to intiailise with the default values
    Serial.println();
    configureGeneral(POLL_DELAY);

    StaticJsonDocument<0> doc;
    configureSensors(doc["payload"]);

    Serial.println();
}

void configCallback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, payload);

    Serial.println();

    configureGeneral(doc["payload"]["poll_delay"] | POLL_DELAY);

    configureSensors(doc["payload"]);

    // once the configuration is parsed, set the configuration received
    clacksConfig.received = true;
}

unsigned short secondsToInterval(unsigned int seconds) {
    double intervalsPerSecond = 1000.0 / clacksConfig.pollDelay;

    unsigned int intervals = ((double)seconds) * intervalsPerSecond;

    if(intervals < 1) {
        intervals = 1u;
    }

    return intervals;
}

void configureGeneral(float pollDelay) {
    clacksConfig.pollDelay = pollDelay * 1000u;
    Serial.print("Poll Delay: ");
    Serial.print(clacksConfig.pollDelay);
    Serial.println("ms");
}

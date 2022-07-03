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
            if(counter++ >= CONFIG_WAIT) {
                Serial.println("No configuration received, giving up...");
                return;
            }

            delay(500);
        }
        Serial.println();
    #else
        // we have to intiailise with the default values
        Serial.println();
        configureGeneral(POLL_DELAY);

        #ifdef DHT22_SENSOR
            configureDHT22(DHT22_SKIP);
        #endif

        #ifdef MOTION_SENSOR
            configurePIR(PIR_INIT_DELAY, PIR_POST_DETECT_SKIP, PIR_POST_MOTION_SKIP);
        #endif
    #endif
}

void configCallback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, payload);

    Serial.println();

    configureGeneral(doc["payload"]["poll_delay"] | POLL_DELAY);

    #ifdef DHT22_SENSOR
        configureDHT22(doc["payload"]["dht22"]["skip"] | DHT22_SKIP);
    #endif

    #ifdef MOTION_SENSOR
        configurePIR(
            doc["payload"]["pir"]["init_delay"] | PIR_INIT_DELAY,
            doc["payload"]["pir"]["post_detect_skip"] | PIR_POST_DETECT_SKIP,
            doc["payload"]["pir"]["post_motion_skip"] | PIR_POST_MOTION_SKIP
        );
    #endif

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

void configureDHT22(unsigned short skip) {
    Serial.println("DHT22:");

    clacksConfig.dht22Skip = secondsToInterval(skip);
    Serial.print("\tSkip: ");
    Serial.print(clacksConfig.dht22Skip);
    Serial.println(" intervals");
}

void configurePIR(float initDelay, unsigned short postDetectSkip, unsigned short postMotionSkip) {
    Serial.println("PIR:");
        
    clacksConfig.pirInitDelay = initDelay * 1000u;
    Serial.print("\tInit Delay: ");
    Serial.print(clacksConfig.pirInitDelay);
    Serial.println("ms");

    clacksConfig.pirPostDetectSkip = secondsToInterval(postDetectSkip);
    Serial.print("\tPost Detect Skip: ");
    Serial.print(clacksConfig.pirPostDetectSkip);
    Serial.println(" intervals");

    clacksConfig.pirPostMotionSkip = secondsToInterval(postMotionSkip);
    Serial.print("\tPost Motion Skip: ");
    Serial.print(clacksConfig.pirPostMotionSkip);
    Serial.println(" intervals");
}

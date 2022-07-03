#ifndef __INCLUDED_CLACKS_H
#define __INCLUDED_CLACKS_H

#include <ArduinoJson.h>

#include "config.h"
#include "mqtt.h"

#define CLACKS_MQTT_TOPIC "powerpi/config/%s/change"

// defaults for DHT22
#define DHT22_SKIP 5 * 60 * 2

// defaults for PIR
#define PIR_INIT_DELAY 60 * 1000
#define PIR_POST_MOTION_SKIP 20 * 2
#define PIR_POST_DETECT_SKIP 5 * 2

struct ClacksConfig_s {
    // whether the configuration was received yet
    bool received;

    // options for the DHT22 sensor
    // the number of loop intervals to skip (5 minutes)
    unsigned short dht22Skip;

    // options for the PIR sensor
    // the time to allow the PIR to initialise (60s)
    unsigned short pirInitDelay;

    // the number of loop intervals to skip between a transition (5s)
    unsigned short pirPostDetectSkip;

    // the number of loop intervals to skip after detection (20s)
    unsigned short pirPostMotionSkip;
} ClacksConfig_default = {
    false,
    DHT22_SKIP,
    PIR_INIT_DELAY,
    PIR_POST_DETECT_SKIP,
    PIR_POST_MOTION_SKIP,
};

typedef struct ClacksConfig_s ClacksConfig;

// the global configuration
ClacksConfig clacksConfig;

void setupClacksConfig();
void configCallback(char* topic, byte* payload, unsigned int length);

#endif

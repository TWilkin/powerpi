#ifndef __INCLUDED_CLACKS_H
#define __INCLUDED_CLACKS_H

#include <ArduinoJson.h>

#include "config.h"
#include "mqtt.h"

#define CLACKS_MQTT_TOPIC "powerpi/config/%s/change"

// general defaults
#define POLL_DELAY 0.5

// defaults for DHT22
#define DHT22_SKIP 5 * 60

// defaults for PIR
#define PIR_INIT_DELAY 60
#define PIR_POST_DETECT_SKIP 5
#define PIR_POST_MOTION_SKIP 20

struct ClacksConfig_s {
    // whether the configuration was received yet
    bool received;

    // the delay between sensor polling (half a second)
    unsigned short pollDelay;

    // options for the DHT22 sensor
    // the number of seconds between polls (5 minutes)
    unsigned short dht22Skip;

    // options for the PIR sensor
    // the number of seconds to allow the PIR to initialise (60s)
    unsigned short pirInitDelay;

    // the number of seconds to skip between a transition (5s)
    unsigned short pirPostDetectSkip;

    // the number of seconds to skip after detection (20s)
    unsigned short pirPostMotionSkip;
} ClacksConfig_default = {
    false,
    POLL_DELAY,
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
unsigned short secondsToInterval(unsigned int seconds);

#endif

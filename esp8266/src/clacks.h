#ifndef __INCLUDED_CLACKS_H
#define __INCLUDED_CLACKS_H

#include <ArduinoJson.h>

#include "config.h"
#include "mqtt.h"

#define CLACKS_MQTT_TOPIC "powerpi/config/%s/change"

// the number of seconds to wait before giving up waiting for the config (1 minute)
#define CONFIG_WAIT 60 * 2

// general defaults
// the delay between sensor polling (half a second)
#define POLL_DELAY 0.5

// defaults for DHT22
// the number of seconds between polls (5 minutes)
#define DHT22_SKIP 5 * 60

// defaults for PIR
// the number of seconds to allow the PIR to initialise (60s)
#define PIR_INIT_DELAY 60

// the number of seconds to skip between a transition (5s)
#define PIR_POST_DETECT_SKIP 5

// the number of seconds to skip after detection (20s)
#define PIR_POST_MOTION_SKIP 20

struct ClacksConfig_s {
    // whether the configuration was received yet
    bool received;

    // the delay between sensor polling in milliseconds
    unsigned int pollDelay;

    // options for the DHT22 sensor
    // the number of intervals to skip between readings
    unsigned short dht22Skip;

    // options for the PIR sensor
    // the number of milliseconds to allow the PIR to initialise
    unsigned int pirInitDelay;

    // the number of intervals to skip between a transition
    unsigned short pirPostDetectSkip;

    // the number of intervals to skip after detection
    unsigned short pirPostMotionSkip;
} ClacksConfig_default = {
    false,
    POLL_DELAY * 1000,
    DHT22_SKIP * 2,
    PIR_INIT_DELAY * 1000,
    PIR_POST_DETECT_SKIP * 2,
    PIR_POST_MOTION_SKIP * 2,
};

typedef struct ClacksConfig_s ClacksConfig;

// the global configuration
ClacksConfig clacksConfig;

void setupClacksConfig();
void configCallback(char* topic, byte* payload, unsigned int length);
unsigned short secondsToInterval(unsigned int seconds);

#endif

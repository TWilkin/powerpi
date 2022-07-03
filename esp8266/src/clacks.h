#ifndef __INCLUDED_CLACKS_H
#define __INCLUDED_CLACKS_H

struct ClacksConfig_s {
    // options for the DHT22 sensor
    // the number of loop intervals to skip (5 minutes)
    unsigned short dht22Skip;

    // options for the PIR sensor
    // the time to allow the PIR to initialise (60s)
    unsigned short pirInitDelay;

    // the number of loop intervals to skip after detection (20s)
    unsigned short pirPostMotionSkip;

    // the number of loop intervals to skip between a transition (5s)
    unsigned short pirPostDetectSkip;
} ClacksConfig_default = {
    5 * 60 * 2,
    60 * 1000,
    20 * 2,
    5 * 2
};

typedef struct ClacksConfig_s ClacksConfig;

// the global configuration
ClacksConfig clacksConfig;

void setupClacksConfig();

#endif

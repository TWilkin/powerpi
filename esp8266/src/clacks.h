#ifndef __INCLUDED_CLACKS_H
#define __INCLUDED_CLACKS_H

struct ClacksConfig_s {
    // options for the PIR sensor
    // the time to allow the PIR to initialise (60s)
    int pirInitDelay;

    // the number of loop intervals to skip after detection (20s)
    int pirPostMotionSkip;

    // the number of loop intervals to skip between a transition (5s)
    int pirPostDetectSkip;
} ClacksConfig_default = {
    60 * 1000,
    20 * 2,
    5 * 2
};

typedef struct ClacksConfig_s ClacksConfig;

// the global configuration
ClacksConfig clacksConfig;

void setupClacksConfig();

#endif

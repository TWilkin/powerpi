#ifndef __INCLUDED_POWERPI_CONFIG_H
#define __INCLUDED_POWERPI_CONFIG_H

#include <ArduinoJson.h>

#include "config.h"
#include "mqtt.h"
#include "sensors.h"

#define POWERPI_CONFIG_MQTT_TOPIC "powerpi/config/%s/change"

// the number of seconds to wait before giving up waiting for the config (1 minute)
#define CONFIG_WAIT 60 * 2

// general defaults
// the delay between sensor polling (half a second)
#define POLL_DELAY 0.5f

struct PowerPiConfig_s {
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

    // the number of checks after we stop seeing motion
    unsigned short pirPostMotionCheck;
} PowerPiConfig_default = { false, 0, 0, 0, 0, 0 };

typedef struct PowerPiConfig_s PowerPiConfig;

// the global configuration
PowerPiConfig powerpiConfig;

void setupPowerPiConfig();
void useDefaultConfig();
void configCallback(char* topic, byte* payload, unsigned int length);
unsigned short secondsToInterval(unsigned int seconds);
void configureGeneral(float pollDelay);

#endif

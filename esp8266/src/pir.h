#ifndef __INCLUDED_PIR_H
#define __INCLUDED_PIR_H

#include <ArduinoJson.h>

#include "mqtt.h"
#include "powerpi-config.h"

// the data pin for the PIR (GPIO5/D1)
#define PIR_PIN 5

// the number of seconds to allow the PIR to initialise (60s)
#define PIR_INIT_DELAY 60u

// the number of seconds to skip between a transition (5s)
#define PIR_POST_DETECT_SKIP 5u

// the number of checks (1/s) to perform after motion is no longer detected (20x)
#define PIR_POST_MOTION_CHECK 20u

// enum for the three possible motion states
typedef enum PIRState {
    // when motion was previously detected
    DETECTED,

    // when motion was not previously detected
    UNDETECTED,

    // in the check phase between detected -> undetected transition
    CHECK
} PIRState;

// the previous detection state
PIRState pirPreviousState;

// the counter for the skipped loops
unsigned short pirCounter = 0;
unsigned short pirCounterMax = 0;

// the counter for how many times we've checked there is still no motion
unsigned short pirCheckCounter = 0;

void setupPIR();
void configurePIR(ArduinoJson::JsonVariant config);
void pollPIR();
void handleMotionEvent(PIRState state);

#endif

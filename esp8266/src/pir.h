#ifndef __INCLUDED_PIR_H
#define __INCLUDED_PIR_H

#include "clacks.h"
#include "mqtt.h"

// the data pin for the PIR (GPIO5/D1)
#define PIR_PIN 5

// the message format
#define PIR_MESSAGE "\"state\":\"%s\""

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

void setupPIR();
void pollPIR();
void handleMotionEvent(PIRState state);

#endif

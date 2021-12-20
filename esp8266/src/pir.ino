#include "pir.h"

void setupPIR() {
    // wait for the PIR to initialise
    delay(PIR_INIT_DELAY);

    pirPreviousState = digitalRead(PIR_PIN) == HIGH ? DETECTED : UNDETECTED;
}

void pollPIR() {
    // check if we're skipping
    if(pirCounterMax > 0) {
        if(pirCounter++ >= pirCounterMax) {
            pirCounter = 0;
            pirCounterMax = 0;
        } else {
            return;
        }
    }

    // check if the pin has changed from last time
    int state = digitalRead(PIR_PIN);
    if(pirPreviousState == UNDETECTED) {
        if(state == HIGH) {
            // publish detected
            pirPreviousState = DETECTED;
            handleMotionEvent(DETECTED);
        }
    } else if(pirPreviousState == DETECTED) {
        if(state == LOW) {
            // we've stopped detecting motion, so switch to the CHECK state and wait
            pirPreviousState = CHECK;
            pirCounterMax = PIR_POST_MOTION_SKIP;
        }
    } else {
        // we are in CHECK state, should we publish undetected?
        if(state == LOW) {
            // it's still low so publish
            pirPreviousState = UNDETECTED;
            handleMotionEvent(UNDETECTED);

            // after HIGH to LOW we need to allow the sensor to reacclimatise
            pirCounterMax = PIR_POST_DETECT_SKIP;
        } else {
            // it's now HIGH again, so switch back to the detected state
            pirPreviousState = DETECTED;
        }
    }
}

void handleMotionEvent(PIRState state) {
    // use the LED to indicate the current state (active LOW)
    digitalWrite(BUILTIN_LED, state == DETECTED ? LOW : HIGH);

    char message[30];

    if(state == DETECTED) {
        snprintf(message, 30, PIR_MESSAGE, "detected");
        Serial.print("d");
    } else {
        snprintf(message, 30, PIR_MESSAGE, "undetected");
        Serial.print("u");
    }

    publish("motion", message);
}

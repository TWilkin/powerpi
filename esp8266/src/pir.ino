#include "pir.h"

void setupPIR() {
    // wait for the PIR to initialise
    delay(clacksConfig.pirInitDelay);

    pirPreviousState = digitalRead(PIR_PIN) == HIGH ? DETECTED : UNDETECTED;
}

void configurePIR(ArduinoJson::JsonVariant config) {
    Serial.println("PIR:");
        
    clacksConfig.pirInitDelay = (config["init_delay"] | PIR_INIT_DELAY) * 1000u;
    Serial.print("\tInit Delay: ");
    Serial.print(clacksConfig.pirInitDelay);
    Serial.println("ms");

    clacksConfig.pirPostDetectSkip = secondsToInterval(config["post_detect_skip"] | PIR_POST_DETECT_SKIP);
    Serial.print("\tPost Detect Skip: ");
    Serial.print(clacksConfig.pirPostDetectSkip);
    Serial.println(" intervals");

    clacksConfig.pirPostMotionCheck = secondsToInterval(config["post_motion_check"] | PIR_POST_MOTION_CHECK);
    Serial.print("\tPost Motion Check: ");
    Serial.print(clacksConfig.pirPostMotionCheck);
    Serial.println(" intervals");
}

void pollPIR() {
    // check if we're skipping
    if(pirCounterMax > 0) {
        if(++pirCounter >= pirCounterMax) {
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
            // we've stopped detecting motion, so switch to the CHECK state
            pirPreviousState = CHECK;
            pirCheckCounter = 0;

            // after HIGH to LOW we need to allow the sensor to reacclimatise
            pirCounterMax = clacksConfig.pirPostDetectSkip;
        }
    } else {
        // we are in CHECK state, should we publish undetected?
        if(state == LOW) {
            // it's still low so increment the counter
            pirCheckCounter++;

            if(pirCheckCounter == clacksConfig.pirPostMotionCheck) {
                // once the counter hits the limit, publish that motion was no longer detected
                pirPreviousState = UNDETECTED;
                handleMotionEvent(UNDETECTED);
            }
        } else {
            // it's now HIGH again, so switch back to the detected state
            pirPreviousState = DETECTED;
        }
    }
}

void handleMotionEvent(PIRState state) {
    // use the LED to indicate the current state (active LOW)
    digitalWrite(BUILTIN_LED, state == DETECTED ? LOW : HIGH);

    StaticJsonDocument<96> message;

    if(state == DETECTED) {
        message["state"] = "detected";
        Serial.print("d");
    } else {
        message["state"] = "undetected";
        Serial.print("u");
    }

    publish("motion", message);
}

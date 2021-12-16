#include "sensors.h"

void setupSensors() {
    #ifdef MOTION_SENSOR
        Serial.println("Motion Sensor");
    #endif

    #ifdef TEMPERATURE_SENSOR
        Serial.println("Temperature Sensor");
        setupDHT22();
    #endif

    #ifdef HUMIDITY_SENSOR
        Serial.println("Humidity Sensor");
    #endif
}

void pollSensors() {
    #ifdef TEMPERATURE_SENSOR
        pollDHT22();
    #endif
}

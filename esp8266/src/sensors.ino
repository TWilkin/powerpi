#include "sensors.h"

void setupSensors() {
    #ifdef MOTION_SENSOR
        Serial.println("Motion Sensor");
        setupPIR();
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
    #ifdef MOTION_SENSOR
        pollPIR();
    #endif
    
    #ifdef TEMPERATURE_SENSOR
        pollDHT22();
    #endif
}

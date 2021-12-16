#include "sensors.h"

void setupSensors() {
    #if MOTION_SENSOR
        Serial.println("Motion Sensor");
    #endif

    #if TEMPERATURE_SENSOR
        Serial.println("Temperature Sensor");
    #endif

    #if HUMIDITY_SENSOR
        Serial.println("Humidity Sensor");
    #endif
}

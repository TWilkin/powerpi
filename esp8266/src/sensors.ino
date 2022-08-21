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

    #ifdef BUTTON_SENSOR
        Serial.println("Button Sensor");
        setupButton();
    #endif

    Serial.println("Ready");
}

void configureSensors(ArduinoJson::JsonVariant config) {
    #ifdef MOTION_SENSOR
        configurePIR(config["pir"]);
    #endif

    #ifdef DHT22_SENSOR
        configureDHT22(config["dht22"]);
    #endif
}

void pollSensors() {
    #ifdef MOTION_SENSOR
        pollPIR();
    #endif
    
    #ifdef DHT22_SENSOR
        pollDHT22();
    #endif
}

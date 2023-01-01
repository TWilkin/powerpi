#include "powerpi-sensor.h"

void setup() {
    // intialise Serial for logging
    Serial.begin(SERIAL_BAUD);
    Serial.print(PACKAGE);
    Serial.print(" v");
    Serial.println(VERSION);

    Serial.print("Location: ");
    Serial.println(LOCATION);

    // connect to WiFi and MQTT
    connectWiFi();
    setupMQTT();

    // retrieve the configuration from clacks
    setupClacksConfig();

    // initialise the sensors
    setupSensors();
}

void loop() {
    Serial.print(".");
    
    // allow NTP to update
    timeClient.update();

    // poll the sensors
    pollSensors();

    #ifdef CLACKS_CONFIG
        // check for messages if clacks is enabled
        mqttClient.loop();
    #endif

    wait();
}

void wait() {
    #ifdef DEEP_SLEEP
        // we want to deep sleep instead of delaying
        ESP.deepSleep(clacksConfig.pollDelay * 1000);
    #else
        // delay before checking the state again
        delay(clacksConfig.pollDelay);
    #endif
}

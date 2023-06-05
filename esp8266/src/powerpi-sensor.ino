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

    // retrieve the configuration from config-server
    setupPowerPiConfig();

    // initialise the sensors
    setupSensors();
}

void loop() {
    Serial.print(".");
    
    // allow NTP to update
    timeClient.update();

    // poll the sensors
    pollSensors();

    #ifdef POWERPI_CONFIG_SERVER
        // check for messages if config-server is enabled
        mqttClient.loop();
    #endif

    wait();
}

inline void wait() {
    #ifdef DEEP_SLEEP
        // we want to deep sleep instead of delaying
        // currently we use the DHT22 skip as well as that's the only sensor that uses deep sleep
        ESP.deepSleep(powerpiConfig.pollDelay * powerpiConfig.dht22Skip * 1000);
    #else
        // delay before checking the state again
        delay(powerpiConfig.pollDelay);
    #endif
}

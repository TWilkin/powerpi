#include "powerpi.h"

void setup() {
    // intialise Serial for logging
    Serial.begin(115200);
    Serial.println("PowerPi Sensor");
    Serial.print("Location: ");
    Serial.println(LOCATION);

    // connect to WiFi and MQTT
    connectWiFi();
    setupMQTT();

    // initialise the sensors
    setupSensors();
}

void loop() {
    Serial.print(".");
    
    // allow NTP to update
    timeClient.update();

    // poll the sensors
    pollSensors();

    // delay before checking the state again
    delay(POLL_DELAY);
}

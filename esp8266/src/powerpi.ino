#include "powerpi.h"

void setup() {
    // intialise Serial for logging
    Serial.begin(115200);
    Serial.println("PowerPi Sensor");
    Serial.print("Location: ");
    Serial.println(LOCATION);

    // connect to WiFi and MQTT
    char* hostname = generateHostname();
    connectWiFi(hostname);
    connectMQTT(hostname);

    // initialise the sensors
    setupSensors();
}

void loop() { }

#include "powerpi.h"

void setup() {
    // intialise Serial for logging
    Serial.begin(115200);
    Serial.println("PowerPi Sensor");
    Serial.print("Location: ");
    Serial.println(LOCATION);

    // initialise the sensors
    setupSensors();

    connectWiFi();
}

void loop() { }

#include "dht22.h"

void setupDHT22() {
    dht.begin();
}

void pollDHT22() {
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if(isnan(humidity) || isnan(temperature)) {
        Serial.println("Failed to read from DHT22 sensor");
    }

    char message[30];

    // generate and publish the temperature message
    snprintf(message, 30, DHT22_MESSAGE, temperature, "°C");
    publish("temperature", message);

    // generate and publish the humidity message
    snprintf(message, 30, DHT22_MESSAGE, humidity, "%");
    publish("humidity", message);
}
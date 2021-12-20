#include "dht22.h"

void setupDHT22() {
    dht.begin();
}

void pollDHT22() {
    // check if we've skipped enough counts
    if(dhtCounter++ >= DHT22_SKIP) {
        dhtCounter = 0;

        float humidity = dht.readHumidity();
        float temperature = dht.readTemperature();

        if(isnan(humidity) || isnan(temperature)) {
            Serial.println("DHT22 read error");
            return;
        }

        char message[30];

        // generate and publish the temperature message
        snprintf(message, 30, DHT22_MESSAGE, temperature, "°C");
        publish("temperature", message);

        // generate and publish the humidity message
        snprintf(message, 30, DHT22_MESSAGE, humidity, "%");
        publish("humidity", message);

        Serial.print("TH");
    }
}

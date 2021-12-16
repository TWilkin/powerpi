#include "dht22.h"

void setupDHT22() {
    dht.begin();
}

void pollDHT22() {
    DHT22Data data;
    data.humidity = dht.readHumidity();
    data.temperature = dht.readTemperature();

    if(isnan(data.humidity) || isnan(data.temperature)) {
        Serial.println("Failed to read from DHT22 sensor");
    }

    Serial.print("Humidity: ");
    Serial.print(data.humidity);
    Serial.println("%");

    Serial.print("Temperature: ");
    Serial.print(data.temperature);
    Serial.println("°C");
}
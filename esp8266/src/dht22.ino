#include "dht22.h"

void setupDHT22() {
    dht.begin();
}

void configureDHT22(ArduinoJson::JsonVariant config) {
    Serial.println("DHT22:");

    clacksConfig.dht22Skip = secondsToInterval(config["skip"] | DHT22_SKIP);
    Serial.print("\tSkip: ");
    Serial.print(clacksConfig.dht22Skip);
    Serial.println(" intervals");
}

void pollDHT22() {
    // check if we've skipped enough counts
    if(dhtCounter++ >= clacksConfig.dht22Skip) {
        dhtCounter = 0;

        float humidity = dht.readHumidity();
        float temperature = dht.readTemperature();

        if(isnan(humidity) || isnan(temperature)) {
            Serial.println("DHT22 read error");
            return;
        }

        StaticJsonDocument<96> message;

        // generate and publish the temperature message
        message["value"] = round(temperature);
        message["unit"] = "°C";
        publish("temperature", message);

        // generate and publish the humidity message
        message["value"] = round(humidity);
        message["unit"] = "%";
        publish("humidity", message);

        Serial.print("TH");
    }
}

double round(double value) {
   return (int)(value * 100 + 0.5) / 100.0;
}

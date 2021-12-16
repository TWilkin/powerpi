#include <DHT.h>

#define DHT_PIN 5
#define DHT_TYPE DHT22

DHT dht = DHT(DHT_PIN, DHT_TYPE);

void setup() {
    Serial.begin(115200);
    Serial.println("Environment Sensor");

    dht.begin();
}

void loop() {
    delay(2 * 1000);
    
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if(isnan(humidity) || isnan(temperature)) {
        Serial.println("Failed to read from DHT sensor");
        return;
    }

    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println("%");

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println("°C");
}

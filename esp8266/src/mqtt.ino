#include "mqtt.h"

void connectMQTT(char* hostname) {
    // wait until it's connected
    while(!mqttClient.connected()) {
        if(!mqttClient.connect(hostname)) {
            Serial.print("MQTT connection failed ");
            Serial.println(mqttClient.state());
            
            delay(500);
        }
    }
}

#ifndef __INCLUDED_MOTION_H
#define __INCLUDED_MOTION_H

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

// MQTT connection details MQTT_SERVER and MQTT_PORT
#include "mqtt.h"

// the location of this sensor LOCATION
#include "location.h"

// constants for the MQTT messages
const char* MQTT_TOPIC = "motion";
const char* MQTT_MESSAGE = "{\"type\": \"motion\", \"location\": \"%s\", \"state\": \"%s\"}";
const char* DETECTED = "detected";
const char* UNDETECTED = "undetected";

// the pin used for the sensor input (GPIO5/D1)
const int PIR_PIN = 5;

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient client(espClient);

// the previous state
int previousState = LOW;

// buffer for writing the MQTT messages to
char message[70];

void connectWiFi();
void connectMQTT();
void eventHandler(int state);
void setup();
void loop();

#endif

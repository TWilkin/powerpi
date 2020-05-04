#ifndef __INCLUDED_MOTION_H
#define __INCLUDED_MOTION_H

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

// MQTT connection details MQTT_SERVER and MQTT_PORT
#include "mqtt.h"

// the location of this sensor LOCATION
#include "location.h"

// constants for the MQTT messages
#define MQTT_TOPIC "motion"
#define MQTT_MESSAGE "{\"type\": \"motion\", \"location\": \"%s\", \"state\": \"%s\"}"
#define DETECTED "detected"
#define UNDETECTED "undetected"

// the maximum length of the hostname
#define HOSTNAME_LEN 32

// the maximum length of the message
#define MESSAGE_LEN 100

// the delay between normal state change polling
#define POLL_DELAY 0.5 * 1000

// the delay before checking for change after a motion event
#define POST_MOTION_DELAY 20 * 1000

// the pin used for the sensor input (GPIO5/D1)
#define PIR_PIN 5

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient client(espClient);

// the device hostname
char hostname[HOSTNAME_LEN];

// the previous state
int previousState;

// buffer for writing the MQTT messages to
char message[MESSAGE_LEN];

void connectWiFi();
void connectMQTT();
void eventHandler(int state);
void setup();
void loop();

#endif

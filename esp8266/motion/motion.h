#ifndef __INCLUDED_MOTION_H
#define __INCLUDED_MOTION_H

#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <PubSubClient.h>
#include <WiFiUdp.h>

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

// MQTT connection details MQTT_SERVER and MQTT_PORT
#include "mqtt.h"

// the location of this sensor LOCATION
#include "location.h"

// enum for the three possible states
typedef enum State {
    // when the light was previously on
    ON,

    // when the light was previously off
    OFF,

    // in the check phase between on -> off transition
    CHECK
} State;

// constants for the MQTT messages
#define MQTT_TOPIC "powerpi/event/%s/motion"
#define MQTT_MESSAGE "{\"state\":\"%s\",\"timestamp\":%ld000}"
#define DETECTED "detected"
#define UNDETECTED "undetected"

// the maximum length of the hostname
#define HOSTNAME_LEN 32

// the maximum length of the topic
#define TOPIC_LEN 40

// the maximum length of the message
#define MESSAGE_LEN 64

// the delay between normal state change polling
#define POLL_DELAY 0.5 * 1000

// the delay before checking for change after an on -> off transition
#define POST_MOTION_DELAY 20 * 1000

// the pin used for the sensor input (GPIO5/D1)
#define PIR_PIN 5

// the WiFi UDF for connecting to NTP
WiFiUDP espUdp;

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the NTP client
NTPClient timeClient(espUdp);

// the MQTT client
PubSubClient client(espClient);

// the device hostname
char hostname[HOSTNAME_LEN];

// the previous state
State previousState;

// the MQTT topic
char topic[TOPIC_LEN];

// buffer for writing the MQTT messages to
char message[MESSAGE_LEN];

void connectWiFi();
void connectMQTT();
void eventHandler(State state);
void setup();
void loop();

#endif

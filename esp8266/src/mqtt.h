#ifndef __INCLUDED_MQTT_H
#define __INCLUDED_MQTT_H

#include <NTPClient.h>
#include <PubSubClient.h>
#include <WiFiUdp.h>

#include "wifi.h"

// the maximum length of the topic
#define TOPIC_LEN 40

// the maximum length of the message
#define MESSAGE_LEN 64

// constants for the MQTT messages
#define MQTT_TOPIC "powerpi/event/%s/%s"
#define MQTT_MESSAGE "{\"timestamp\":%ld000,%s}"

// the WiFi UDF for connecting to NTP
WiFiUDP espUdp;

// the NTP client
NTPClient timeClient(espUdp);

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient mqttClient(espClient);

void setupMQTT();
void connectMQTT(bool waitForNTP);
void publish(char* action, char* props);

#endif

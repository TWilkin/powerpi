#ifndef __INCLUDED_MQTT_H
#define __INCLUDED_MQTT_H

#include <NTPClient.h>
#include <PubSubClient.h>

#include "wifi.h"

// the WiFi UDF for connecting to NTP
WiFiUDP espUdp;

// the NTP client
NTPClient timeClient(espUdp);

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient mqttClient(espClient);

void connectMQTT(char* hostname);

#endif

#ifndef __INCLUDED_MQTT_H
#define __INCLUDED_MQTT_H

#include <PubSubClient.h>

#include "wifi.h"

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient mqttClient(espClient);

void connectMQTT(char* hostname);

#endif

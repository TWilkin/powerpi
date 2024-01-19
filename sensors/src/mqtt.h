#ifndef __INCLUDED_MQTT_H
#define __INCLUDED_MQTT_H

#include <ArduinoJson.h>
#include <NTPClient.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <WiFiUdp.h>

#include "cert.h"
#include "wifi.h"

// the maximum length of the topic
#define TOPIC_LEN 40

// the maximum length of the message
#define MESSAGE_LEN 64

// the sensor MQTT topic
#define MQTT_TOPIC "powerpi/event/%s/%s"

// the delay after an MQTT action
#define MQTT_ACTION_DELAY 0.5 * 1000u // half a second

// the number of NTP retries before restarting the sensor
#define MAX_NTP_RETRIES 10

// the WiFi UDF for connecting to NTP
WiFiUDP espUdp;

// the NTP client
NTPClient timeClient(espUdp);

// the WiFiClient for connecting to MQTT
#ifdef MQTT_SSL
WiFiClientSecure espClient;
#else
WiFiClient espClient;
#endif

#ifdef MQTT_SSL
// the root CA
X509List cert(cert_LetsEncrypt_R3);
#endif

// the MQTT client
PubSubClient mqttClient(espClient);

void setupMQTT();
void connectMQTT(bool waitForNTP);
void publish(const char action[], ArduinoJson::JsonDocument& message);

#endif

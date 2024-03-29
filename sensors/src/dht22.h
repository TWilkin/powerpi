#ifndef __INCLUDED_DHT22_H
#define __INCLUDED_DHT22_H

#include <ArduinoJson.h>
#include <DHT.h>
#include <limits.h>

#include "mqtt.h"
#include "powerpi-config.h"

// the data pin for the DHT22 (GPIO4/D2)
#define DHT22_PIN 4

// the number of seconds between polls (5 minutes)
#define DHT22_SKIP 5u * 60u

// the sensor instance
DHT dht = DHT(DHT22_PIN, DHT22);

// the counter for the skipped loops
// initialised to a large value so the reading will happen at start
unsigned short dhtCounter = USHRT_MAX - 1;

void setupDHT22();
void configureDHT22(ArduinoJson::JsonVariant config);
void pollDHT22();
double round2dp(double value);

#endif

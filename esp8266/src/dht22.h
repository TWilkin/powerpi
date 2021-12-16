#ifndef __INCLUDED_DHT22_H
#define __INCLUDED_DHT22_H

#include <DHT.h>

#include "mqtt.h"

#define TEMPERATURE_SENSOR
#define HUMIDITY_SENSOR

// the data pin for the DHT22 (GPIO5/D1)
#define DHT22_PIN 5

// the message format
#define DHT22_MESSAGE "\"value\":%.1f,\"unit\":\"%s\""

// the sensor instance
DHT dht = DHT(DHT22_PIN, DHT22);

void setupDHT22();
void pollDHT22();

#endif

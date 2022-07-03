#ifndef __INCLUDED_DHT22_H
#define __INCLUDED_DHT22_H

#include <DHT.h>
#include <limits.h>

#include "clacks.h"
#include "mqtt.h"

// the data pin for the DHT22 (GPIO4/D2)
#define DHT22_PIN 4

// the message format
#define DHT22_MESSAGE "\"value\":%.1f,\"unit\":\"%s\""

// the sensor instance
DHT dht = DHT(DHT22_PIN, DHT22);

// the counter for the skipped loops
// initialised to a large value so the reading will happen at start
unsigned short dhtCounter = USHRT_MAX - 1;

void setupDHT22();
void pollDHT22();

#endif

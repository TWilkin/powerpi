#ifndef __INCLUDED_DHT22_H
#define __INCLUDED_DHT22_H

#include <DHT.h>
#include <limits.h>

#include "mqtt.h"

// the data pin for the DHT22 (GPIO5/D1)
#define DHT22_PIN 5

// the delay between sensor polling (5 minutes)
#define DHT22_POLL_DELAY 5 * 60 * 1000

// the message format
#define DHT22_MESSAGE "\"value\":%.1f,\"unit\":\"%s\""

// the sensor instance
DHT dht = DHT(DHT22_PIN, DHT22);

// the counter for the skipped loops
unsigned int dhtCounter = UINT_MAX;

void setupDHT22();
void pollDHT22();

#endif

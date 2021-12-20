#ifndef __INCLUDED_POWERPI_SENSOR_H
#define __INCLUDED_POWERPI_SENSOR_H

#include "config.h"
#include "mqtt.h"
#include "sensors.h"
#include "wifi.h"

// the delay between sensor polling (30 seconds)
#define POLL_DELAY 0.5 * 1000

void setup();
void loop();

#endif

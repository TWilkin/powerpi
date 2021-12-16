#ifndef __INCLUDED_POWERPI_H
#define __INCLUDED_POWERPI_H

#include "config.h"
#include "mqtt.h"
#include "sensors.h"
#include "wifi.h"

// the delay between sensor polling
#define POLL_DELAY 0.5 * 1000

void setup();
void loop();

#endif

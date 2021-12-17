#ifndef __INCLUDED_SENSORS_H
#define __INCLUDED_SENSORS_H

#include "config.h"
#include "dht22.h"
#include "pir.h"

void setupSensors();
void pollSensors();

#endif

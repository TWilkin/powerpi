#ifndef __INCLUDED_SENSORS_H
#define __INCLUDED_SENSORS_H

#include <ArduinoJson.h>

#include "config.h"
#include "button.h"
#include "dht22.h"
#include "pir.h"

void setupSensors();
void configureSensors(ArduinoJson::JsonVariant config);
void pollSensors();

#endif

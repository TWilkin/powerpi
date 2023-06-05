#ifndef __INCLUDED_BUTTON_H
#define __INCLUDED_BUTTON_H

#include <ArduinoJson.h>
#include <EasyButton.h>

#include "mqtt.h"

// the data pin for the button (GPIO0/D3)
#define BUTTON_PIN 0

// the button instance to use
EasyButton button(BUTTON_PIN);

void setupButton();
void pollButton();
void handleButtonPress();

#endif

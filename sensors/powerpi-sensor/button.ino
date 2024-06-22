#include "button.h"

void setupButton() {
    button.begin();
    
    button.onPressed(handleButtonPress);

    button.enableInterrupt(pollButton);
}

void pollButton() {
    button.read();
}

void handleButtonPress() {
    StaticJsonDocument<96> message;

    message["button"] = "default";
    message["type"] = "single";
    publish("press", message);

    Serial.print("p");
}

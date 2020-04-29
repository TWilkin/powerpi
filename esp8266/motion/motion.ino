#include <ESP8266WiFi.h>

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

void connectWiFi() {
  // initialise WiFi connection
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // wait until it's connected
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  // intialise Serial for logging
  Serial.begin(115200);

  // connect to WiFi
  connectWiFi();
}

void loop() {
}

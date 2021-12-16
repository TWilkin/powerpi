#include "wifi.h"

void connectWiFi() {
  // set the hostname
  char hostname[HOSTNAME_LEN];
  snprintf(hostname, HOSTNAME_LEN, "%sMotionSensor", LOCATION);

  // initialise WiFi connection
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.hostname(hostname);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // wait until it's connected
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");

  // print the IP address
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

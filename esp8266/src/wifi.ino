#include "wifi.h"

char* generateHostname() {
    char hostname[HOSTNAME_LEN];
    
    snprintf(hostname, HOSTNAME_LEN, "%sMotionSensor", LOCATION);

    return hostname;
}

void connectWiFi(char* hostname) {
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

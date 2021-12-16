#ifndef __INCLUDED_WIFI_H
#define __INCLUDED_WIFI_H

#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

// the maximum length of the hostname
#define HOSTNAME_LEN 32

char* generateHostname();

void connectWiFi(char* hostname);

#endif

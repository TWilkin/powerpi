#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

// MQTT connection details MQTT_SERVER and MQTT_PORT
#include "mqtt.h"

// constants for the MQTT messages
const char* MQTT_TOPIC = "motion";
const char* MQTT_MESSAGE = "{\"type\": \"motion\", \"location\": \"hallway\", \"state\": \"%s\"}";
const char* DETECTED = "detected";
const char* UNDETECTED = "undetected";

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient client(espClient);

// buffer for writing the MQTT messages to
char message[70];

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

void connectMQTT() {
  // initialise the MQTT connection
  client.setServer(MQTT_SERVER, MQTT_PORT);
  Serial.print("Connecting to ");
  Serial.println(MQTT_SERVER);

  // wait until it's connected
  while(!client.connected()) {
    if(client.connect("MotionSensor")) {
      Serial.println("Connected");
    } else {
      Serial.println("Connection failed, retrying");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

void setup() {
  // intialise Serial for logging
  Serial.begin(115200);

  // connect to WiFi
  connectWiFi();

  // connect to MQTT
  connectMQTT();

  // publish a detected event
  snprintf(message, 70, MQTT_MESSAGE, DETECTED);
  Serial.print("Publishing message ");
  Serial.println(message);
  client.publish(MQTT_TOPIC, message);
}

void loop() {
}

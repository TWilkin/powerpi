#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// WiFi connection details WIFI_SSID and WIFI_PASSWORD
#include "wifi.h"

// MQTT connection details MQTT_SERVER and MQTT_PORT
#include "mqtt.h"

// the location of this sensor LOCATION
#include "location.h"

// constants for the MQTT messages
const char* MQTT_TOPIC = "motion";
const char* MQTT_MESSAGE = "{\"type\": \"motion\", \"location\": \"%s\", \"state\": \"%s\"}";
const char* DETECTED = "detected";
const char* UNDETECTED = "undetected";

// the pin used for the sensor input (GPIO5/D1)
const int PIR_PIN = 5;

// the WiFiClient for connecting to MQTT
WiFiClient espClient;

// the MQTT client
PubSubClient client(espClient);

// the previous state
int previousState = LOW;

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
  // wait until it's connected
  while(!client.connected()) {
    // generate the id
    char clientId[10];
    snprintf(clientId, 10, "%sMS", LOCATION);

    if(!client.connect(clientId)) {
      Serial.print("MQTT connection failed ");
      Serial.println(client.state());
      delay(500);
    }
  }
}

void eventHandler(int state) {
  // use the LED to indicate the current state (active LOW)
  digitalWrite(BUILTIN_LED, !state);

  // act for detected and undetected
  if(state == HIGH) {
    snprintf(message, 70, MQTT_MESSAGE, LOCATION, DETECTED);
    Serial.print("d");
  } else {
    snprintf(message, 70, MQTT_MESSAGE, LOCATION, UNDETECTED);
    Serial.print("u");
  }

  // publish the event
  connectMQTT();
  client.publish(MQTT_TOPIC, message);

  // store the new state for the next comparison
  previousState = state;
}

void setup() {
  // initialise the pins
  pinMode(BUILTIN_LED, OUTPUT);
  pinMode(PIR_PIN, INPUT);

  // intialise Serial for logging
  Serial.begin(115200);
  Serial.println("Motion Sensor");
  Serial.print("Location: ");
  Serial.println(LOCATION);

  // connect to WiFi
  connectWiFi();

  // initialise the MQTT connection
  client.setServer(MQTT_SERVER, MQTT_PORT);
  Serial.print("Using MQTT: ");
  Serial.print(MQTT_SERVER);
  Serial.print(":");
  Serial.println(MQTT_PORT);

  // wait for 1 minute for the sensor to initialise
  delay(60 * 1000);
  Serial.println("Ready");

  // ensure MQTT matches the current state
  eventHandler(digitalRead(PIR_PIN));
}

void loop() {
  Serial.print(".");

  // check if the pin has changed from last time
  int state = digitalRead(PIR_PIN);
  if(state != previousState) {
    // we have a change
    eventHandler(state);

    // wait 5 seconds before checking again when transitioning HIGH->LOW
    if(state == LOW) {
      delay(5 * 1000);
    }
  }

  delay(500);
}

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#include "motion.h"

void connectWiFi() {
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
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  // wait until it's connected
  while(!client.connected()) {
    if(!client.connect(hostname)) {
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
    snprintf(message, MESSAGE_LEN, MQTT_MESSAGE, LOCATION, DETECTED);
    Serial.print("d");
  } else {
    snprintf(message, MESSAGE_LEN, MQTT_MESSAGE, LOCATION, UNDETECTED);
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
  snprintf(hostname, HOSTNAME_LEN, "%sMotionSensor", LOCATION);
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
  previousState = LOW;
  eventHandler(digitalRead(PIR_PIN));
}

void loop() {
  Serial.print(".");

  // check if the pin has changed from last time
  int state = digitalRead(PIR_PIN);
  if(state != previousState) {
    // we have a change
    eventHandler(state);

    // wait before checking for another state change
    if(state == LOW) {
      // after HIGH to LOW we need to allow the sensor 5s
      // to acclimatise
      delay(5 * 1000);
    } else {
      // we don't want to detect more motion for a period
      // after the motion was originally detected
      delay(POST_MOTION_DELAY);
    }
  } else {
    // delay before checking the state again
    delay(POLL_DELAY);
  }
}

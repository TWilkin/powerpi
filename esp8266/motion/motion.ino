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

void eventHandler(State state) {
  // use the LED to indicate the current state (active LOW)
  digitalWrite(BUILTIN_LED, state == ON ? LOW : HIGH);

  // act for detected and undetected
  if(state == ON) {
    snprintf(message, MESSAGE_LEN, MQTT_MESSAGE, DETECTED);
    Serial.print("d");
  } else {
    snprintf(message, MESSAGE_LEN, MQTT_MESSAGE, UNDETECTED);
    Serial.print("u");
  }

  // publish the event
  connectMQTT();
  client.publish(topic, message, true);
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
  snprintf(topic, TOPIC_LEN, MQTT_TOPIC, LOCATION);

  // wait for 1 minute for the sensor to initialise
  delay(60 * 1000);
  Serial.println("Ready");

  // ensure MQTT matches the current state
  previousState = digitalRead(PIR_PIN) == HIGH ? ON : OFF;
  eventHandler(previousState);
}

void loop() {
  Serial.print(".");

  // check if the pin has changed from last time
  int state = digitalRead(PIR_PIN);
  if(previousState == OFF) {
    if(state == HIGH) {
      // turn the light on
      previousState = ON;
      eventHandler(ON);
    }
  } else if(previousState == ON) {
    if(state == LOW) {
      // we've stopped detecting motion, so switch to the CHECK state and wait
      previousState = CHECK;
      delay(POST_MOTION_DELAY);
    }
  } else {
    // we are in CHECK state, should we switch off?
    if(state == LOW) {
      // it's still low so switch off
      previousState = OFF;
      eventHandler(OFF);

      // after HIGH to LOW we need to allow the sensor 5s
      // to acclimatise
      delay(5 * 1000);
    } else {
      // it's now HIGH again, so switch back to the ON state
      previousState = ON;
    }
  }

  // delay before checking the state again
  delay(POLL_DELAY);
}

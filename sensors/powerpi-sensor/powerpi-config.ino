#include "powerpi-config.h"

void setupPowerPiConfig()
{
    // initialise the PowerPi config with the default values
    powerpiConfig = PowerPiConfig_default;

// if we are using config-server
#ifdef POWERPI_CONFIG_SERVER
    // generate the topic
    char topic[TOPIC_LEN];
    snprintf(topic, TOPIC_LEN, POWERPI_CONFIG_MQTT_TOPIC, LOCATION);

    // subscribe to MQTT
    mqttClient.setCallback(configCallback);
    connectMQTT(false);
    mqttClient.subscribe(topic);

    // wait for the message
    Serial.println("Waiting for configuration");
    int counter = 0;
    while (!powerpiConfig.received)
    {
        Serial.print(".");

        mqttClient.loop();

        // terminate if we can't get the configuration after 60s
        if (++counter >= CONFIG_WAIT)
        {
            Serial.println("No configuration received, giving up...");
            useDefaultConfig();
            return;
        }

        delay(500);
    }
    Serial.println();
#else
    useDefaultConfig();
#endif
}

void useDefaultConfig()
{
    // we have to initialise with the default values
    Serial.println();
    configureGeneral(POLL_DELAY);

    StaticJsonDocument<0> doc;
    configureSensors(doc["payload"]);

    Serial.println();
}

void configCallback(char *topic, byte *payload, unsigned int length)
{
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, payload);

    Serial.println();

    configureGeneral(doc["payload"]["poll_delay"] | POLL_DELAY);

    configureSensors(doc["payload"]);

    // once the configuration is parsed, set the configuration received
    powerpiConfig.received = true;
}

unsigned short secondsToInterval(unsigned int seconds)
{
    double intervalsPerSecond = 1000.0 / powerpiConfig.pollDelay;

    unsigned int intervals = ((double)seconds) * intervalsPerSecond;

    if (intervals < 1)
    {
        intervals = 1u;
    }

    return intervals;
}

void configureGeneral(float pollDelay)
{
    powerpiConfig.pollDelay = pollDelay * 1000u;
    Serial.print("Poll Delay: ");
    Serial.print(powerpiConfig.pollDelay);
    Serial.println("ms");
}

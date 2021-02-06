#!/bin/sh

# export the config to variables
DEVICES=`tr "\n" " " < $DEVICES_FILE | sed s/\"/\\\\\"/g`
EVENTS=`tr "\n" " " < $EVENTS_FILE | sed s/\"/\\\\\"/g`

echo "Starting power-starter"
docker run \
    --privileged \
    --device $GPIOMEM \
    --env "DEVICE_FATAL=$DEVICE_FATAL" \
    --env "ENERGENIE_DEVICE=$ENERGENIE_DEVICE" \
    --env "MQTT_ADDRESS=$MQTT_ADDRESS" \
    --env "TOPIC_BASE=$TOPIC_BASE" \
    --env "POLL_FREQUENCY=$POLL_FREQUENCY" \
    --env "DEVICES=$DEVICES" \
    --env "EVENTS=$EVENTS" \
    $POWER_STARTER_IMAGE

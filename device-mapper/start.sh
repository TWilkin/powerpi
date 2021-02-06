#!/bin/sh

# export the config to variables
DEVICES=`tr "\n" " " < $DEVICES_FILE | sed s/\"/\\\\\"/g`
EVENTS=`tr "\n" " " < $EVENTS_FILE | sed s/\"/\\\\\"/g`

# generate a name for the container
NAME=powerpi_power-starter.1.`hostname`

# function to ensure the spawned container is stopped
function stop() {
    echo "Stopping container $NAME"
    docker stop $NAME
    exit
}

# ensure we have the latest version of the image
echo "Updating power-starter image"
docker pull $POWER_STARTER_IMAGE

# trap so if this container is stopped, it will stop the spawned container
echo "Setting exit trap condition"
trap 'kill ${!}; stop' SIGINT
trap 'kill ${!}; stop' SIGTERM

# start the container running on the node hosting this
echo "Starting power-starter"
docker run \
    --privileged \
    --name $NAME \
    --device $GPIOMEM \
    --network powerpi \
    --env "DEVICE_FATAL=$DEVICE_FATAL" \
    --env "ENERGENIE_DEVICE=$ENERGENIE_DEVICE" \
    --env "MQTT_ADDRESS=$MQTT_ADDRESS" \
    --env "TOPIC_BASE=$TOPIC_BASE" \
    --env "POLL_FREQUENCY=$POLL_FREQUENCY" \
    --env "DEVICES=$DEVICES" \
    --env "EVENTS=$EVENTS" \
    $POWER_STARTER_IMAGE \
    & wait ${!}

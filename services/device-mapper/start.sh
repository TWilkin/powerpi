#!/bin/bash

# generate a name for the container
NAME=powerpi_$CONTROLLER_NAME.1.`hostname`

# function to ensure the spawned container is stopped
function stop() {
    echo "Stopping container $NAME"
    docker stop $NAME
    exit
}

# ensure we have the latest version of the image
echo "Updating image $IMAGE"
docker pull $IMAGE

# trap so if this container is stopped, it will stop the spawned container
echo "Setting exit trap condition"
trap 'kill ${!}; stop' SIGINT
trap 'kill ${!}; stop' SIGTERM

# add optional arguments
args=()

# optional volume
if [ -v VOLUME ]
then
    args+=("--mount type=bind,src=$VOLUME,dst=/var/data")
fi

# optional env array
IFS=':'; arrEnv=($ENV); unset IFS;
for env in "${arrEnv[@]}"
do
    args+=("--env \"$env\"")
done

# start the container running on the node hosting this
echo "Starting $CONTROLLER_NAME"
docker run \
    --privileged \
    --name $NAME \
    --device $DEVICE \
    --network powerpi \
    ${args[@]} \
    $IMAGE \
    & wait ${!}
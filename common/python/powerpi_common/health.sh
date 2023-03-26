#!/bin/sh

HEALTH_FILE=/usr/src/app/powerpi_health
if [ ! -f $HEALTH_FILE ]
then
    # the file doesn't exist, that's unhealthy
    exit 1
fi

NOW=$(date +%s)
HEALTH=$(stat $HEALTH_FILE -c %Y)
SINCE=$(expr $NOW - $HEALTH)

if [ $SINCE -gt 20 ]
then
    # the health file is older than 20s, that's unhealthy
    exit 2
fi

# it's less than 20s, that's healthy
exit 0

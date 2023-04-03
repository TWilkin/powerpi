#!/bin/sh

# the number of seconds the health check file can be since last modification without being unhealthy
AGE=$1

# the path to the health check file
HEALTH_FILE=$2

if [ -z $AGE ]
then
    AGE=12
fi

if [ -z $HEALTH_FILE ]
then
    HEALTH_FILE=/home/node/app/powerpi_health
fi

if [ ! -f $HEALTH_FILE ]
then
    # the file doesn't exist, that's unhealthy
    exit 1
fi

NOW=$(date +%s)
HEALTH=$(stat $HEALTH_FILE -c %Y)
SINCE=$(expr $NOW - $HEALTH)

if [ $SINCE -gt $AGE ]
then
    # the health file is older than AGE, that's unhealthy
    exit 2
fi

# it's newer than AGE, that's healthy
exit 0

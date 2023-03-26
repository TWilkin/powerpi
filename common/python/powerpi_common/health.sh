#!/bin/bash

NOW=$(date +%s)
HEALTH=$(stat /var/run/powerpi_health -c %Y)
SINCE=$(expr $NOW - $HEALTH)

if [ $SINCE -gt 20 ]
then
    # the health file is older than 20s, that's unhealthy
    exit 1
fi

# it's less than 20s, that's healthy
exit 0

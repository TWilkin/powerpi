FROM docker:20.10.17-alpine3.16

LABEL description="PowerPi Docker-in-docker container to launch containers that need device access"

# install the start script
RUN apk add --no-cache bash
COPY services/device-mapper/start.sh ./

# set the signal the script is expecting
STOPSIGNAL SIGINT

# run the start script 
CMD bin/bash start.sh

FROM docker:19.03.8
LABEL description="Docker-in-docker container to launch containers that need device access"

# install the start script
RUN apk add --no-cache bash
COPY services/device-mapper/start.sh ./

# set the signal the script is expecting
STOPSIGNAL SIGINT

# run the start script 
CMD bin/bash start.sh

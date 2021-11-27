FROM docker:19.03.8
LABEL description="Docker-in-docker container to launch containers that need device access"

# install the start script
COPY device-mapper/start.sh ./

# set the signal the script is expecting
STOPSIGNAL SIGINT

# run the start script 
CMD bin/sh start.sh

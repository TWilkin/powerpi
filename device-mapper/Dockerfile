FROM docker:latest
LABEL description="Docker-in-docker container to launch containers that need device access"

# install the start script
COPY start.sh ./

# run the start script 
CMD bin/sh start.sh

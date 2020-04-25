FROM arm32v6/alpine:3.10
LABEL maintainer="tom@twilkin,uk", description="Cron service to generate time events in MQTT"

# install the mosquitto client
RUN apk update && apk upgrade && \
    apk add --no-cache mosquitto-clients

# install the cron job
COPY tick-cron /etc/cron.d/tick-cron
RUN crontab /etc/cron.d/tick-cron
RUN touch /var/log/cron.log

# start cron and tail the log
CMD crond \
    && tail -F /var/log/cron.log

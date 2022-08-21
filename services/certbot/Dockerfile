FROM certbot/certbot:arm64v8-v1.29.0
LABEL description="PowerPi Certbot automatic SSL certificate renewal"

# use non-root user
RUN addgroup -g 101 certbot \
    && adduser --disabled-password -u 101 -G certbot certbot
RUN mkdir -p /opt/certbot \
    && chown -R certbot.certbot /opt/certbot
USER certbot

# setup crontab to renew
COPY --chown=certbot:certbot services/certbot/crontab /etc/crontabs/certbot

# add the renew script
WORKDIR /opt/certbot
COPY --chown=certbot:certbot services/certbot/renew.sh ./
RUN chmod +x renew.sh

# wait on cron
ENTRYPOINT ["crond", "-f"]

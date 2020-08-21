FROM qemu AS qemu-image
FROM certbot/certbot:arm32v6-v1.6.0
LABEL description="Certbot automatic SSL certificate renewal"

COPY --from=qemu-image qemu-arm-static /usr/bin/

# setup crontab to renew
ADD crontab /etc/crontabs/root

# add the renew script
WORKDIR /opt/certbot
COPY renew.sh ./
RUN chmod +x renew.sh

# wait on cron
ENTRYPOINT ["crond", "-f"]

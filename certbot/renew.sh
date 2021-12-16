#!/bin/sh

PWD=`pwd`

# renew (or request a new) certificate
certbot \
    certonly \
    --webroot --webroot-path=/var/www/html \
    --email $EMAIL --agree-tos --no-eff-email \
    --renew-by-default \
    --non-interactive \
    -d $EXTERNAL_HOST_NAME \
    --config-dir $PWD \
    --work-dir $PWD \
    --logs-dir $PWD

# create a symlink as NGINX doesn't support environment variables in the config files
rm -f /etc/letsencrypt/live/default
ln -s /etc/letsencrypt/live/$EXTERNAL_HOST_NAME /etc/letsencrypt/live/default

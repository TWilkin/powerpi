#!/bin/sh

certbot \
    certonly \
    --webroot --webroot-path=/var/www/html \
    --email $EMAIL --agree-tos --no-eff-email \
    --renew-by-default \
    --non-interactive \
    -d $EXTERNAL_HOST_NAME

ln -s /etc/letsencrypt/live/$EXTERNAL_HOST_NAME /etc/letsencrypt/live/default

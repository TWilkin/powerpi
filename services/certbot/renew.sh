#!/bin/sh

OUT_DIR=/etc/letsencrypt

# renew (or request a new) certificate
certbot \
    certonly \
    --webroot --webroot-path=/var/www/html \
    --email $EMAIL --agree-tos --no-eff-email \
    --renew-by-default \
    --non-interactive \
    -d $EXTERNAL_HOST_NAME \
    --config-dir $OUT_DIR \
    --work-dir $OUT_DIR \
    --logs-dir $OUT_DIR

# create a symlink as NGINX doesn't support environment variables in the config files
rm -f $OUT_DIR/live/default
ln -s $OUT_DIR/live/$EXTERNAL_HOST_NAME $OUT_DIR/live/default

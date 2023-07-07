#!/bin/sh

# first we want to encrypt the password file
/usr/sbin/mosquitto_passwd -U /var/run/secrets/mosquitto-password-secret/passwords

# now start mosquitto
exec /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf

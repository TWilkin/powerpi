FROM arm32v6/nginx:1.19-alpine
LABEL maintainer="tom@twilkin.uk", description="SSL protected NGINX"

# add qemu so we can build from x86
COPY qemu-arm-static /usr/bin

# download letsencrypt configuration files
WORKDIR /var/www/
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# copy across the config
WORKDIR /etc/nginx/conf.d/
COPY default.conf ./

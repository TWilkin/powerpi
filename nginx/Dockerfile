FROM qemu AS qemu-image
FROM arm32v6/nginx:1.19-alpine
LABEL description="NGINX reverse proxy to protect web accessible endpoints with SSL"

COPY --from=qemu-image qemu-arm-static /usr/bin/

# download letsencrypt configuration files
WORKDIR /etc/nginx/
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# copy across the config
WORKDIR /etc/nginx/conf.d/
COPY default.conf ./

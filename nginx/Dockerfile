FROM qemu AS qemu-image
FROM node:14-alpine AS build-image
LABEL description="Node.js to compile PowerPi UI"

# install the dependencies
WORKDIR /usr/src/app
COPY ui/package*.json ./
RUN npm install

# transpile the application
COPY ui/ ./
RUN npm run build

FROM arm32v6/nginx:1.19-alpine AS run-image
LABEL description="NGINX reverse proxy to protect web accessible endpoints with SSL"

COPY --from=qemu-image qemu-arm-static /usr/bin/

# download letsencrypt configuration files
WORKDIR /etc/nginx/
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# copy the built UI application into the NGINX container
ENV UI_DIR=/var/www/powerpi
RUN mkdir -p $UI_DIR/public && \
    mkdir $UI_DIR/dist
WORKDIR $UI_DIR
COPY --from=build-image /usr/src/app/public/ ./public/
COPY --from=build-image /usr/src/app/dist/ ./dist/

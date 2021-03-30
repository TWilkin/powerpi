FROM node:14-alpine AS build-image
LABEL description="Node.js to compile PowerPi UI"

# download letsencrypt configuration files
WORKDIR /usr/src/app
RUN apk add curl \
    && curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf \
    && curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# install the dependencies
COPY ui/package*.json ./
RUN npm install

# transpile the application
COPY ui/ ./
RUN npm run build

FROM nginx:1.17.10-alpine AS run-image
LABEL description="NGINX reverse proxy to protect web accessible endpoints with SSL and host UI"

EXPOSE 80
EXPOSE 443

# copy letsencrypt configuration files
WORKDIR /etc/nginx/
COPY --from=build-image /usr/src/app/options-ssl-nginx.conf ./
COPY --from=build-image /usr/src/app/ssl-dhparams.pem ./

# copy the built UI application into the NGINX container
ENV UI_DIR=/var/www/powerpi
RUN mkdir -p $UI_DIR
WORKDIR $UI_DIR
COPY --from=build-image /usr/src/app/public/ ./
COPY --from=build-image /usr/src/app/dist/ ./

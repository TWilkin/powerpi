FROM node:14-alpine AS build-image
LABEL description="Node.js to compile PowerPi UI"

# install curl and download the letsencrypt configuration files
WORKDIR /usr/src/app
RUN apk add curl
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# install the libraries
WORKDIR /usr/src/app/common/node/api
COPY common/node/api/ ./
RUN npm install \
    && npm run build

# install the dependencies
WORKDIR /usr/src/app/nginx/ui
COPY nginx/ui/package*.json ./
RUN npm install

# transpile the application
COPY nginx/ui/ ./
RUN npm run build

FROM nginx:1.17.10-alpine AS run-image
LABEL description="NGINX reverse proxy to protect web accessible endpoints with SSL and host UI"

EXPOSE 80
EXPOSE 443

# copy the letsencrypt configuration files
WORKDIR /etc/nginx/
COPY --from=build-image /usr/src/app/options-ssl-nginx.conf ./
COPY --from=build-image /usr/src/app/ssl-dhparams.pem ./

# copy the built UI application into the NGINX container
ENV UI_DIR=/var/www/powerpi
RUN mkdir -p $UI_DIR
WORKDIR $UI_DIR
COPY --from=build-image /usr/src/app/nginx/ui/public/ ./
COPY --from=build-image /usr/src/app/nginx/ui/dist/ ./

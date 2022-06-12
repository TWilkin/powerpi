FROM amd64/node:16.13.1-alpine3.12 AS build-image
LABEL description="Compile PowerPi UI"

# overcome network error when downloading libraries
RUN yarn config set network-timeout 600000 -g

# install curl and download the letsencrypt configuration files
WORKDIR /usr/src/app
RUN apk add curl
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
RUN curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem

# install the libraries
WORKDIR /home/node/app
RUN mkdir -p ./common/node/api ./nginx/ui
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/api/package.json ./common/node/api/
RUN yarn workspace @powerpi/api install --frozen-lockfile
COPY common/node/api ./common/node/api/
RUN yarn workspace @powerpi/api build

# install the dependencies
COPY nginx/ui/package.json ./nginx/ui
RUN yarn workspace @powerpi/ui install --frozen-lockfile

# transpile the application
COPY nginx/ui ./nginx/ui/
RUN yarn workspace @powerpi/ui build

FROM nginx:1.18.0-alpine AS run-image
LABEL description="PowerPi NGINX"

# use non-root user
RUN mkdir -p /var/www/powerpi
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown -R nginx:nginx /var/www
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 8080 8443

# copy the letsencrypt configuration files
WORKDIR /etc/nginx/
COPY --from=build-image --chown=nginx:nginx /usr/src/app/options-ssl-nginx.conf ./
COPY --from=build-image --chown=nginx:nginx /usr/src/app/ssl-dhparams.pem ./

# copy the built UI application into the NGINX container
WORKDIR /var/www/powerpi
COPY --chown=nginx:nginx LICENSE ./
COPY --from=build-image --chown=nginx:nginx /home/node/app/nginx/ui/public/ ./
COPY --from=build-image --chown=nginx:nginx /home/node/app/nginx/ui/dist/ ./

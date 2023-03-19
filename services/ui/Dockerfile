FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-api-image
LABEL description="Node.js builder for API library"

# install the API library
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/api
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/api/package.json ./common/node/api/
RUN yarn workspace @powerpi/api install --frozen-lockfile
COPY common/node/api ./common/node/api/
RUN yarn workspace @powerpi/api build

FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-ui-image
LABEL description="Node.js builder for UI"

# install the UI
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/api/package.json ./common/node/api/
COPY --from=build-api-image /home/node/app/common/node/api/dist/ ./common/node/api/dist/
RUN mkdir -p /home/node/app/services/ui
COPY package.json yarn.lock tsconfig.json ./
COPY services/ui/package.json ./services/ui/
RUN yarn workspace @powerpi/ui install --frozen-lockfile
COPY services/ui ./services/ui/
RUN yarn workspace @powerpi/ui build

FROM nginx:1.23.1-alpine AS run-image
LABEL description="PowerPi UI"

# use non-root user
RUN mkdir -p /var/www/powerpi
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown -R nginx:nginx /var/www
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 8080

# copy the built UI application into the NGINX container
WORKDIR /var/www/powerpi
COPY --chown=nginx:nginx LICENSE ./
COPY --from=build-ui-image --chown=nginx:nginx /home/node/app/services/ui/public/ ./
COPY --from=build-ui-image --chown=nginx:nginx /home/node/app/services/ui/dist/ ./

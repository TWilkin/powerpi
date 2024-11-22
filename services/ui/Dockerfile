FROM --platform=$BUILDPLATFORM node:20.18.1-alpine3.20 AS build-api-image
LABEL description="Node.js builder for API library"

# install the API library
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common-api
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common-api/package.json ./common/node/common-api/
RUN yarn workspace @powerpi/common-api install --frozen-lockfile
COPY common/node/common-api ./common/node/common-api/
RUN yarn workspace @powerpi/common-api build

FROM --platform=$BUILDPLATFORM node:20.18.1-alpine3.20 AS build-ui-image
LABEL description="Node.js builder for UI"

# install the UI
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/common-api/package.json ./common/node/common-api/
COPY --from=build-api-image /home/node/app/common/node/common-api/dist/ ./common/node/common-api/dist/
RUN mkdir -p /home/node/app/services/ui
COPY package.json yarn.lock tsconfig.json ./
COPY services/ui/package.json ./services/ui/
RUN yarn workspace @powerpi/ui install --frozen-lockfile
COPY services/ui ./services/ui/
RUN yarn workspace @powerpi/ui build

FROM nginx:1.27.2-alpine3.20-slim AS run-image
LABEL description="PowerPi UI"

# use non-root user
RUN mkdir -p /var/www/powerpi \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown -R nginx:nginx /var/www \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid
USER nginx

EXPOSE 8080

# copy the built UI application into the NGINX container
WORKDIR /var/www/powerpi
COPY --chown=nginx:nginx LICENSE ./
COPY --from=build-ui-image --chown=nginx:nginx /home/node/app/services/ui/dist/ ./

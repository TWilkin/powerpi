# build the API library
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-api-image
LABEL description="Node.js builder for common API library"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common-api
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common-api/package.json ./common/node/common-api/
RUN yarn workspace @powerpi/common-api install --frozen-lockfile
COPY common/node/common-api ./common/node/common-api/
RUN yarn workspace @powerpi/common-api build

# build the common library
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-common-image
LABEL description="Node.js builder for common library"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common/package.json ./common/node/common/
RUN yarn workspace @powerpi/common install --frozen-lockfile
COPY common/node/common ./common/node/common/
RUN yarn workspace @powerpi/common build

# build the service
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-service-image
LABEL description="Node.js builder for the API service"
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/common-api/package.json ./common/node/common-api/
COPY --from=build-api-image /home/node/app/common/node/common-api/dist/ ./common/node/common-api/dist/
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
RUN mkdir -p /home/node/app/services/api
COPY package.json yarn.lock tsconfig.json ./
COPY services/api/package.json ./services/api/
RUN yarn workspace @powerpi/api install --frozen-lockfile
COPY services/api ./services/api/
RUN yarn workspace @powerpi/api build

# service image
FROM node:16.16.0-alpine3.16 as run-image
LABEL description="PowerPi API service"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common-api/dist \
    /home/node/app/common/node/common/dist \
    /home/node/app/services/api

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/common-api/package.json ./common/node/common-api/
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/common-api/dist/ ./common/node/common-api/dist/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/api/package.json ./services/api/
RUN yarn workspace @powerpi/api install --production --frozen-lockfile

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/api/dist/ ./services/api/dist/

# start the application once the container is ready
CMD yarn workspace @powerpi/api start:prd

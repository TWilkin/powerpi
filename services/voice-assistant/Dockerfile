# build the API library
FROM --platform=$BUILDPLATFORM node:23.6.1-alpine3.20 AS build-api-image
LABEL description="Node.js builder for API library"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common-api
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common-api/package.json ./common/node/common-api/
RUN yarn workspace @powerpi/common-api install --frozen-lockfile
COPY common/node/common-api ./common/node/common-api/
RUN yarn workspace @powerpi/common-api build

# build the common library
FROM --platform=$BUILDPLATFORM node:23.6.1-alpine3.20 AS build-common-image
LABEL description="Node.js builder for common library"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common/package.json ./common/node/common/
RUN yarn workspace @powerpi/common install --frozen-lockfile
COPY common/node/common ./common/node/common/
RUN yarn workspace @powerpi/common build

# build the common test library
FROM --platform=$BUILDPLATFORM node:23.6.1-alpine3.20 AS build-common-test-image
LABEL description="Node.js builder for common-test library"
WORKDIR /home/node/app
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
RUN mkdir -p /home/node/app/common/node/common-test
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common-test/package.json ./common/node/common-test/
RUN yarn workspace @powerpi/common-test install --frozen-lockfile
COPY common/node/common-test ./common/node/common-test/
RUN yarn workspace @powerpi/common-test build

# build the service
FROM --platform=$BUILDPLATFORM node:23.6.1-alpine3.20 AS build-service-image
LABEL description="Node.js builder for voice-assistant service"
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/common-api/package.json ./common/node/common-api/
COPY --from=build-api-image /home/node/app/common/node/common-api/dist/ ./common/node/common-api/dist/
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
COPY --from=build-common-test-image /home/node/app/common/node/common-test/package.json ./common/node/common-test/
COPY --from=build-common-test-image /home/node/app/common/node/common-test/dist/ ./common/node/common-test/dist/
RUN mkdir -p /home/node/app/services/voice-assistant
COPY package.json yarn.lock tsconfig.json ./
COPY services/voice-assistant/package.json ./services/voice-assistant/
RUN yarn workspace @powerpi/voice-assistant install --frozen-lockfile
COPY services/voice-assistant ./services/voice-assistant/
RUN yarn workspace @powerpi/voice-assistant build

# voice-assistant service image
FROM node:23.6.1-alpine3.20 AS run-image
LABEL description="PowerPi voice-assistant Alexa webhook service"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common-api/dist \
    /home/node/app/common/node/common/dist \
    /home/node/app/services/voice-assistant/dist

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/common-api/package.json ./common/node/common-api/
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/common-api/dist/ ./common/node/common-api/dist/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/voice-assistant/package.json ./services/voice-assistant/
RUN yarn workspace @powerpi/voice-assistant install --production --frozen-lockfile \
    && yarn cache clean

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/voice-assistant/dist/ ./services/voice-assistant/dist/

# start the application once the container is ready
CMD ["yarn", "workspace", "@powerpi/voice-assistant", "start:prd"]

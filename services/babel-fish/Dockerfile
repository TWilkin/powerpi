# build the API library
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-api-image
LABEL description="Node.js builder for API library"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/api
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/api/package.json ./common/node/api/
RUN yarn workspace @powerpi/api install --frozen-lockfile
COPY common/node/api ./common/node/api/
RUN yarn workspace @powerpi/api build

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

# build the common test library
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-common-test-image
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
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-service-image
LABEL description="Node.js builder for babel-fish service"
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/api/package.json ./common/node/api/
COPY --from=build-api-image /home/node/app/common/node/api/dist/ ./common/node/api/dist/
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
COPY --from=build-common-test-image /home/node/app/common/node/common-test/package.json ./common/node/common-test/
COPY --from=build-common-test-image /home/node/app/common/node/common-test/dist/ ./common/node/common-test/dist/
RUN mkdir -p /home/node/app/services/babel-fish
COPY package.json yarn.lock tsconfig.json ./
COPY services/babel-fish/package.json ./services/babel-fish/
RUN yarn workspace @powerpi/babel-fish install --frozen-lockfile
COPY services/babel-fish ./services/babel-fish/
RUN yarn workspace @powerpi/babel-fish build

# babel-fish service image
FROM node:16.16.0-alpine3.16 as run-image
LABEL description="PowerPi babel-fish Alexa webhook service"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/api/dist \
    /home/node/app/common/node/common/dist \
    /home/node/app/services/babel-fish/dist

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/package.json ./common/node/api/
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/dist/ ./common/node/api/dist/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/babel-fish/package.json ./services/babel-fish/
RUN yarn workspace @powerpi/babel-fish install --production --frozen-lockfile

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/babel-fish/dist/ ./services/babel-fish/dist/

# start the application once the container is ready
CMD yarn workspace @powerpi/babel-fish start:prd

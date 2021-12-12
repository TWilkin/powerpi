FROM node:16.13.1-alpine3.12 as build-image
LABEL description="Node.js builder for common libraries"

# install the libraries
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/node/common
COPY package.json yarn.lock tsconfig.json ./
COPY common/node/common/package.json ./common/node/common/
RUN yarn workspace @powerpi/common install
COPY common/node/common ./common/node/common/
RUN yarn workspace @powerpi/common build

FROM node:16.13.1-alpine3.12 as run-image
LABEL description="Node.js application to persist MQTT messages to database"

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common/dist \
     /home/node/app/persistence

# copy the built common library
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock tsconfig.json ./
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --chown=node:node persistence/package.json ./persistence
RUN yarn workspace persistence install --production

# copy the application
COPY --chown=node:node persistence ./persistence

# start the application once the container is ready
CMD yarn workspace persistence start

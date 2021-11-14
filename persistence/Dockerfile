FROM node:14.18.1-alpine3.11 as build-image
LABEL description="Node.js builder for common libraries"

# install the libraries
WORKDIR /home/node/app/common/node/common
COPY common/node/common/package*.json ./
RUN npm install
COPY common/node/common ./
RUN npm run build

FROM node:14.18.1-alpine3.11 as run-image
LABEL description="Node.js application to persist MQTT messages to database"

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common /home/node/app/persistence

# copy the built common library
WORKDIR /home/node/app/common/node/common
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/package* ./
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/dist/ ./

# install the dependencies
WORKDIR /home/node/app/persistence
COPY --chown=node:node persistence/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node persistence ./

# start the application once the container is ready
CMD npm start

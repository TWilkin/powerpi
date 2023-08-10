# build the service
FROM --platform=$BUILDPLATFORM node:20.5.0-alpine3.18 as build-service-image
LABEL description="Node.js builder for freedns service"
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/services/freedns
COPY package.json yarn.lock tsconfig.json ./
COPY services/freedns/package.json ./services/freedns/
RUN yarn workspace @powerpi/freedns install --frozen-lockfile
COPY services/freedns ./services/freedns/
RUN yarn workspace @powerpi/freedns build

# service image
FROM node:20.5.0-alpine3.18 as run-image
LABEL description="PowerPi FreeDNS Dynamic DNS service"

# use non-root account
USER node
RUN mkdir -p /home/node/app/services/freedns

# install the dependencies
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-service-image --chown=node:node /home/node/app/services/freedns/package.json ./services/freedns/
RUN yarn workspace @powerpi/freedns install --production --frozen-lockfile

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/freedns/dist/ ./services/freedns/dist/

# start the application once the container is ready
CMD yarn workspace @powerpi/freedns start:prd --daemon

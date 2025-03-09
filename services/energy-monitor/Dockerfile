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

# build the service
FROM --platform=$BUILDPLATFORM node:23.6.1-alpine3.20 AS build-service-image
LABEL description="Node.js builder for energy-monitor service"
WORKDIR /home/node/app
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
RUN mkdir -p /home/node/app/services/energy-monitor
COPY package.json yarn.lock tsconfig.json ./
COPY services/energy-monitor/package.json ./services/energy-monitor/
RUN yarn workspace @powerpi/energy-monitor install --frozen-lockfile
COPY services/energy-monitor ./services/energy-monitor/
RUN yarn workspace @powerpi/energy-monitor build

# service image
FROM node:23.6.1-alpine3.20 AS run-image
LABEL description="PowerPi energy-monitor N3rgy usage retrieval service"

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common/dist \
    /home/node/app/services/energy-monitor

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/energy-monitor/package.json ./services/energy-monitor/
RUN yarn workspace @powerpi/energy-monitor install --production --frozen-lockfile \
    && yarn cache clean

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/energy-monitor/dist/ ./services/energy-monitor/dist/

# start the application once the container is ready
CMD ["yarn", "workspace", "@powerpi/energy-monitor", "start:prd", "--daemon"]

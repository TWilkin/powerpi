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
LABEL description="Node.js builder for light-fantastic service"
WORKDIR /home/node/app
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
RUN mkdir -p /home/node/app/services/light-fantastic
COPY package.json yarn.lock tsconfig.json ./
COPY services/light-fantastic/package.json ./services/light-fantastic/
RUN yarn workspace @powerpi/light-fantastic install --frozen-lockfile
COPY services/light-fantastic ./services/light-fantastic/
RUN yarn workspace @powerpi/light-fantastic build

# service image
FROM node:16.16.0-alpine3.16 as run-image
LABEL description="PowerPi light-fantastic Light Schedule service"

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common/dist \
    /home/node/app/services/light-fantastic

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/light-fantastic/package.json ./services/light-fantastic/
RUN yarn workspace @powerpi/light-fantastic install --production --frozen-lockfile

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/light-fantastic/dist/ ./services/light-fantastic/dist/

# start the application once the container is ready
CMD yarn workspace @powerpi/light-fantastic start:prd

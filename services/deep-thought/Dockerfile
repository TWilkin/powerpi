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

# build the service
FROM --platform=$BUILDPLATFORM node:16.16.0-alpine3.16 as build-service-image
LABEL description="Node.js builder for deep-thought service"
WORKDIR /home/node/app
COPY --from=build-api-image /home/node/app/common/node/api/package.json ./common/node/api/
COPY --from=build-api-image /home/node/app/common/node/api/dist/ ./common/node/api/dist/
COPY --from=build-common-image /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image /home/node/app/common/node/common/dist/ ./common/node/common/dist/
RUN mkdir -p /home/node/app/services/deep-thought
COPY package.json yarn.lock tsconfig.json ./
COPY services/deep-thought/package.json ./services/deep-thought/
RUN yarn workspace @powerpi/deep-thought install --frozen-lockfile
COPY services/deep-thought ./services/deep-thought/
RUN yarn workspace @powerpi/deep-thought build

# service image
FROM node:16.16.0-alpine3.16 as run-image
LABEL description="PowerPi deep-thought API service"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/api/dist \
    /home/node/app/common/node/common/dist \
    /home/node/app/services/deep-thought

# copy the built common libraries
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock LICENSE ./
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/package.json ./common/node/api/
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/dist/ ./common/node/api/dist/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package.json ./common/node/common/
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./common/node/common/dist/

# install the dependencies
COPY --from=build-service-image --chown=node:node /home/node/app/services/deep-thought/package.json ./services/deep-thought/
RUN yarn workspace @powerpi/deep-thought install --production --frozen-lockfile

# copy the built application
COPY --from=build-service-image --chown=node:node /home/node/app/services/deep-thought/dist/ ./services/deep-thought/dist/

# start the application once the container is ready
CMD yarn workspace @powerpi/deep-thought start:prd

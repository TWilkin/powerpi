FROM node:14-alpine as build-api-image
LABEL description="Node.js builder for API library"

# install the API library
WORKDIR /home/node/app/common/node/api
COPY common/node/api/package*.json ./
RUN npm install
COPY common/node/api ./
RUN npm run build

FROM node:14-alpine as build-common-image
LABEL description="Node.js builder for common library"

# install the common library
WORKDIR /home/node/app/common/node/common
COPY common/node/common/package*.json ./
RUN npm install
COPY common/node/common ./
RUN npm run build

FROM node:14-alpine as run-image
LABEL description="Node.js webhook service for Alexa skills"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/api /home/node/app/babel-fish

# copy the built common libraries
WORKDIR /home/node/app/common/node/api
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/package* ./
COPY --from=build-api-image --chown=node:node /home/node/app/common/node/api/dist/ ./
WORKDIR /home/node/app/common/node/common
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/package* ./
COPY --from=build-common-image --chown=node:node /home/node/app/common/node/common/dist/ ./

# install the dependencies
WORKDIR /home/node/app/babel-fish
COPY --chown=node:node babel-fish/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node babel-fish ./

# start the application once the container is ready
CMD npm start

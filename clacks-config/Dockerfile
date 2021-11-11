FROM node:14.18.1-alpine3.11 as build-image
LABEL description="Node.js builder for common library"

# install the common library
WORKDIR /home/node/app/common/node/common
COPY common/node/common/package*.json ./
RUN npm install
COPY common/node/common ./
RUN npm run build

FROM node:14.18.1-alpine3.11 as run-image
LABEL description="Node.js configuration service"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common /home/node/app/clacks-config

# copy the built common libraries
WORKDIR /home/node/app/common/node/common
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/package* ./
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/dist/ ./

# install the dependencies
WORKDIR /home/node/app/clacks-config
COPY --chown=node:node clacks-config/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node clacks-config ./

# start the application once the container is ready
CMD npm start

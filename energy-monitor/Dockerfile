FROM node:14-alpine as build-image
LABEL description="Node.js builder for common libraries"

# install the libraries
WORKDIR /home/node/app/common/node/common
COPY common/node/common/package*.json ./
RUN npm install
COPY common/node/common ./
RUN npm run build

FROM node:14-alpine as run-image
LABEL description="Node.js energy monitor service"

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/common /home/node/app/energy-monitor

# copy the built common library
WORKDIR /home/node/app/common/node/common
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/package* ./
COPY --from=build-image --chown=node:node /home/node/app/common/node/common/dist/ ./

# install the dependencies
WORKDIR /home/node/app/energy-monitor
COPY --chown=node:node energy-monitor/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node energy-monitor ./

# start the application once the container is ready
CMD npm start

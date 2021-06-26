FROM node:14-alpine as build-image
LABEL description="Node.js builder for common libraries"

# install the libraries
WORKDIR /home/node/app/common/node/api
COPY common/node/api/package*.json ./
RUN npm install
COPY common/node/api ./
RUN npm run build

FROM node:14-alpine as run-image
LABEL description="Node.js webhook service for Alexa/Google Home skills"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/api /home/node/app/skill

# copy the build common library
WORKDIR /home/node/app/common/node/api
COPY --from=build-image --chown=node:node /home/node/app/common/node/api/package* ./
COPY --from=build-image --chown=node:node /home/node/app/common/node/api/dist/ ./

# install the dependencies
WORKDIR /home/node/app/skill
COPY --chown=node:node skill/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node skill ./

# start the application once the container is ready
CMD npm start

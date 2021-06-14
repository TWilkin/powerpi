FROM node:14-alpine
LABEL description="Node.js webhook service for Alexa/Google Home skills"

# expose the port used by the application
EXPOSE 3000

# use non-root account
USER node
RUN mkdir -p /home/node/app/common/node/api /home/node/app/skill

# install the libraries
WORKDIR /home/node/app/common/node/api
COPY --chown=node:node common/node/api/package*.json ./
RUN npm install --production
COPY --chown=node:node common/node/api ./

# install the dependencies
WORKDIR /home/node/app/skill
COPY --chown=node:node skill/package*.json ./
RUN npm install --production

# copy the application
COPY --chown=node:node skill ./

# start the application once the container is ready
CMD npm start

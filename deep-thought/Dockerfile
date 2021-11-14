FROM node:14.18.1-alpine3.11
LABEL description="Node.js application API for PowerPi"

# expose the port used by the application
EXPOSE 3000

# install the dependencies
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node deep-thought/package*.json ./
RUN npm install --production

# copy across the application code
COPY --chown=node:node deep-thought/. ./

# start the application once the container is ready
CMD npm start

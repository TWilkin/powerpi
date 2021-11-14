FROM node:14.18.1-alpine3.11
LABEL description="Node.js application API for PowerPi"

# install the dependencies
WORKDIR /usr/src/app
COPY deep-thought/package*.json ./
RUN npm install

# copy across the application code
COPY deep-thought/. ./

# expose the port used by the application
EXPOSE 3000

# start the application once the container is ready
CMD npm start

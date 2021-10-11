FROM node:14-alpine
LABEL description="Node.js application to control LIFX light colour and brightness"

# install the dependencies
WORKDIR /usr/src/app
COPY light-fantastic/package*.json ./
RUN npm install

# copy across the application code
COPY light-fantastic/. .

# start the application once the container is ready
CMD npm start

FROM node:10.17.0-alpine3.10
LABEL maintainer="tom@xzi-xzone.com"

# install the dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# copy across the application code
COPY . .

# expose the port used by the application
EXPOSE 3000

# start the application once the container is ready
CMD node -r esm app.js

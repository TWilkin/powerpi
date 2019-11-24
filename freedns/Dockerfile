FROM arm32v6/node:10.17.0-alpine3.10
LABEL maintainer="tom@xzi-xzone.com"

# add qemu so we can build from x86
COPY qemu-arm-static /usr/bin

# install the dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# copy across the application code
COPY . .

# start the application once the container is ready
CMD node -r esm app.js

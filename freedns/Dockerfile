FROM 192.168.2.10:5000/arm32v6/node-qemu:10.17.0-alpine3.10
LABEL maintainer="tom@xzi-xzone.com",description="Node.js application to update external IP address in FreeDNS"

# install the dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# copy across the application code
COPY . .

# start the application once the container is ready
CMD npm start

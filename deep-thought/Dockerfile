FROM qemu AS qemu-image
FROM arm32v6/node:14-alpine
LABEL description="Node.js application API for PowerPi"

COPY --from=qemu-image qemu-arm-static /usr/bin/

# install the dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# copy across the application code
COPY . .

# expose the port used by the application
EXPOSE 3000

# start the application once the container is ready
CMD npm start

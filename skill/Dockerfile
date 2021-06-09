FROM node:14-alpine AS build-image
LABEL description="Node.js to compile webhook service for Alexa/Google Home skills"

# install the dependencies
WORKDIR /usr/src/app
COPY skill/package*.json ./
RUN npm install

# transpile the application
COPY skill ./
RUN npm run build; exit 0
RUN npm prune --production

FROM node:14-alpine AS run-image
LABEL description="Node.js webhook service for Alexa/Google Home skills"

# expose the port used by the application
EXPOSE 3000

# copy the build application service into the container
WORKDIR /usr/src/app
COPY --from=build-image /usr/src/app/dist ./dist/
COPY --from=build-image /usr/src/app/node_modules ./node_modules/
COPY --from=build-image /usr/src/app/package*.json ./

# start the application once the container is ready
RUN ls -lah
CMD npm start

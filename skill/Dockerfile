FROM node:14-alpine
LABEL description="Node.js webhook service for Alexa/Google Home skills"

# expose the port used by the application
EXPOSE 3000

# install the dependencies
WORKDIR /usr/src/app
COPY skill/package*.json ./
RUN npm install --production

# copy the application
COPY skill ./

# start the application once the container is ready
CMD npm start

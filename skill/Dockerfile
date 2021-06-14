FROM node:14-alpine
LABEL description="Node.js webhook service for Alexa/Google Home skills"

# expose the port used by the application
EXPOSE 3000

# use powerpi account
RUN adduser -D -H -S -s /bin/false -u 1001 powerpi

# install the dependencies
WORKDIR /usr/src/app
COPY skill/package*.json ./
RUN npm install --production

# copy the application
COPY skill ./
RUN chown -R powerpi .

# start the application once the container is ready
USER powerpi
CMD npm start

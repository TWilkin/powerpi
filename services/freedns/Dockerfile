FROM node:16.13.1-alpine3.12
LABEL description="Node.js application to update external IP address in FreeDNS"

# use non-root account
USER node
RUN mkdir -p /home/node/app/services/freedns

# install the dependencies
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock tsconfig.json LICENSE ./
COPY --chown=node:node services/freedns/package.json ./services/freedns/
RUN yarn workspace @powerpi/freedns install --production

# copy across the application code
COPY --chown=node:node services/freedns ./services/freedns

# start the application once the container is ready
CMD yarn workspace @powerpi/freedns start

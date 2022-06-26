FROM node:16.13.1-alpine3.12
LABEL description="Node.js application to update external IP address in FreeDNS"

# use non-root account
USER node
RUN mkdir -p /home/node/app/freedns

# install the dependencies
WORKDIR /home/node/app
COPY --chown=node:node package.json yarn.lock tsconfig.json LICENSE ./
COPY --chown=node:node freedns/package.json ./freedns/
RUN yarn workspace freedns install --production

# copy across the application code
COPY --chown=node:node freedns ./freedns

# start the application once the container is ready
CMD yarn workspace services/freedns start

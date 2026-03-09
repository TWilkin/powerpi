FROM --platform=$BUILDPLATFORM golang:1.24.2-alpine3.21 AS build-image
LABEL description="Go builder for config-server service"

ARG TARGETPLATFORM
ENV GOOS=linux
ENV GOARCH=${TARGETPLATFORM##*/}

RUN apk add --no-cache make
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/go \
    /home/node/app/services/config-server
COPY common/go/go.mod common/go/go.sum ./common/go/
COPY services/config-server/go.mod services/config-server/go.sum ./services/config-server/
WORKDIR /home/node/app/services/config-server
RUN go mod download
WORKDIR /home/node/app
COPY common/go ./common/go/
COPY services/config-server ./services/config-server/
WORKDIR /home/node/app/services/config-server
RUN make clean; \
    make GOOS=$GOOS GOARCH=$GOARCH

# service image
FROM alpine:3.21 AS run-image
LABEL description="PowerPi config-server configuration service"

# use non-root account
RUN adduser --disabled-password --uid 1000 powerpi
USER 1000

WORKDIR /home/node/app
COPY --from=build-image --chown=powerpi /home/node/app/services/config-server/bin/powerpi_config_server .

# start the application once the container is ready
CMD ["./powerpi_config_server"]

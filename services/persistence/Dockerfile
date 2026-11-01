FROM --platform=$BUILDPLATFORM golang:1.26.1-alpine3.23 AS build-image
LABEL description="Go builder for persistence service"

ARG TARGETPLATFORM
ENV GOOS=linux
ENV GOARCH=${TARGETPLATFORM##*/}

RUN apk add --no-cache make
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/go \
    /home/node/app/services/persistence
COPY common/go/go.mod common/go/go.sum ./common/go/
COPY services/persistence/go.mod services/persistence/go.sum ./services/persistence/
WORKDIR /home/node/app/services/persistence
RUN go mod download
WORKDIR /home/node/app
COPY common/go ./common/go/
COPY services/persistence ./services/persistence/
WORKDIR /home/node/app/services/persistence
RUN make clean; \
    make GOOS=$GOOS GOARCH=$GOARCH compile

# service image
FROM scratch AS run-image
LABEL description="PowerPi persistence MQTT store service"

# use non-root account
USER 1000

WORKDIR /home/node/app
COPY --from=build-image /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build-image --chown=powerpi /home/node/app/services/persistence/bin/powerpi_persistence .

# start the application once the container is ready
CMD ["./powerpi_persistence"]

FROM --platform=$BUILDPLATFORM golang:1.24.2-alpine3.21 AS build-image
LABEL description="Go builder for energy-monitor service"

ARG TARGETPLATFORM
ENV GOOS=linux
ENV GOARCH=${TARGETPLATFORM##*/}

RUN apk add --no-cache make
WORKDIR /home/node/app
RUN mkdir -p /home/node/app/common/go \
    /home/node/app/services/energy-monitor
COPY common/go/go.mod common/go/go.sum ./common/go/
COPY services/energy-monitor/go.mod services/energy-monitor/go.sum ./services/energy-monitor/
WORKDIR /home/node/app/services/energy-monitor
RUN go mod download
WORKDIR /home/node/app
COPY common/go ./common/go/
COPY services/energy-monitor ./services/energy-monitor/
WORKDIR /home/node/app/services/energy-monitor
RUN make clean; \
    make GOOS=$GOOS GOARCH=$GOARCH

# service image
FROM alpine:3.21 AS run-image
LABEL description="PowerPi energy-monitor usage retrieval service"

# use non-root account
RUN adduser --disabled-password --uid 1000 powerpi
USER 1000 # powerpi

WORKDIR /home/node/app
COPY --from=build-image --chown=powerpi /home/node/app/services/energy-monitor/bin/powerpi_energy_monitor .

# start the application once the container is ready
CMD ["./powerpi_energy_monitor"]

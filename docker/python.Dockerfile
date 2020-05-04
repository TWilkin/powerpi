FROM arm32v6/python:3.8.0-alpine3.10
LABEL maintainer="tom@twilkin.uk", description="Python alpine ARM base image build on x86"

# add qemu so we can build from x86
COPY qemu-arm-static /usr/bin

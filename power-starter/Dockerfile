FROM arm32v6/python:3.8.0-alpine3.10 AS compile-image
LABEL maintainer="tom@xzi-xzone.com"

# add qemu so we can build from x86
COPY qemu-arm-static /usr/bin

# ensure we have the dependencies to run pip
RUN apk update && apk upgrade && \
    apk add --no-cache gcc git musl-dev

# make a virtual env
ENV VENV=/opt/venv
RUN python -m venv $VENV

# install the dependencies
COPY requirements.txt ./
RUN $VENV/bin/pip install -r requirements.txt

# use multi-stage build to remove compile dependencies
FROM arm32v6/python:3.8.0-alpine3.10 AS build-image
ENV VENV=/usr/src/app/venv
COPY --from=compile-image /opt/venv $VENV

# copy across the application code
WORKDIR /usr/src/app
COPY . .

# start the application once the container is ready
CMD $VENV/bin/python src/main.py

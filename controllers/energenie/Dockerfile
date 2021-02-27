FROM python:3.9.2-alpine AS compile-image
LABEL description="Python application to listen to the queue and start/stop Energenie devices as requested"

# ensure we have the dependencies to run pip
RUN apk update \
    && apk upgrade \
    && apk add --no-cache gcc git linux-headers musl-dev

# make a virtual env
ENV VENV=/opt/venv
RUN python -m venv $VENV
RUN $VENV/bin/pip install wheel

# install the dependencies
ENV CFLAGS=-fcommon
COPY controllers/energenie/requirements.txt ./
RUN $VENV/bin/pip install -r requirements.txt

# recompile the binary
WORKDIR $VENV/lib/python3.9/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine AS build-image
WORKDIR /usr/src/app
COPY --from=compile-image /opt/venv ./venv

# add the application
COPY controllers/energenie/src/ ./
RUN rm common && mkdir ./common
COPY common/python/* ./common/

# start the application once the container is ready
CMD venv/bin/python main.py

FROM python:3.8.6-alpine3 AS compile-image
LABEL description="Python application to listen to the queue and start/stop devices as requested"

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
COPY requirements.txt ./
RUN $VENV/bin/pip install -r requirements.txt

# recompile the binary
WORKDIR $VENV/lib/python3.8/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c

# build and install the wheel
WORKDIR /usr/src/app
COPY . .
RUN python setup.py sdist bdist_wheel \
    && $VENV/bin/pip install dist/power_starter-*.whl

# use multi-stage build to remove compile dependencies
FROM python:3.8.6-alpine AS build-image
ENV VENV=/usr/src/app/venv
COPY --from=compile-image /opt/venv $VENV

# start the application once the container is ready
WORKDIR $VENV
CMD bin/python lib/python*/site-packages/power_starter/main.py

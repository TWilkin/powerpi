FROM 192.168.2.10:5000/arm32v6/python-qemu:3.8.0-alpine3.10 AS compile-image
LABEL maintainer="tom@twilkin.uk", description="Python application to listen to the queue and start/stop devices as requested"

# ensure we have the dependencies to run pip
RUN apk update && apk upgrade && \
    apk add --no-cache gcc git linux-headers musl-dev

# make a virtual env
ENV VENV=/opt/venv
RUN python -m venv $VENV

# install the dependencies
COPY requirements.txt ./
RUN $VENV/bin/pip install -r requirements.txt

# build and install the wheel
WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/power_starter/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c
WORKDIR /usr/src/app
RUN python setup.py sdist bdist_wheel \
    && $VENV/bin/pip install dist/power_starter-*.whl

# use multi-stage build to remove compile dependencies
FROM 192.168.2.10:5000/arm32v6/python-qemu:3.8.0-alpine3.10 AS build-image
ENV VENV=/usr/src/app/venv
COPY --from=compile-image /opt/venv $VENV

# start the application once the container is ready
WORKDIR $VENV
CMD bin/python lib/python*/site-packages/power_starter/main.py

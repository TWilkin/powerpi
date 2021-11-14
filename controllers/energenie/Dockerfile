FROM python:3.9.2-alpine3.12 AS build-image
LABEL description="Python application to listen to the queue and start/stop Energenie devices as requested"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc git musl-dev \
    && pip3 install pipenv
ENV CFLAGS=-fcommon

# copy over the common library
WORKDIR /opt/powerpi/controllers/energenie
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/energenie/Pipfile* ./
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --three --deploy --ignore-pipfile

# re-compile the binary
WORKDIR /opt/powerpi/controllers/energenie/.venv/lib/python3.9/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine3.12 AS run-image
WORKDIR /usr/src/app
RUN addgroup -g 997 -S gpio \
    && adduser --disabled-password powerpi \
    && addgroup powerpi gpio
USER powerpi
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/energenie/.venv ./venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# add the application
COPY --chown=powerpi controllers/energenie/energenie_controller ./energenie_controller/

# start the application once the container is ready
CMD python -m energenie_controller

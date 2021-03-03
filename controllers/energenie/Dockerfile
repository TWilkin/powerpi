FROM python:3.9.2-alpine AS compile-image
LABEL description="Python application to listen to the queue and start/stop Energenie devices as requested"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc git linux-headers musl-dev \
    && pip3 install pipenv

# create the virtualenv
ENV VIRTUAL_ENV=/opt/venv \
    PIPENV_VERBOSITY=-1 \
    CFLAGS=-fcommon
RUN python3 -m virtualenv $VIRTUAL_ENV

# copy over the common library
WORKDIR /opt/powerpi/controllers/energenie
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/energenie/Pipfile* ./
RUN pipenv install --three --deploy --ignore-pipfile

# recompile the binary
WORKDIR $VIRTUAL_ENV/lib/python3.9/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine AS build-image
WORKDIR /usr/src/app
COPY --from=compile-image /opt/venv ./venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# add the application
COPY controllers/energenie/src/ ./

# start the application once the container is ready
CMD python main.py

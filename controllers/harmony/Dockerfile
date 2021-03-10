FROM python:3.9.2-alpine AS compile-image
LABEL description="Python application to listen to the queue and start/stop Logitech Harmony activities as requested"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc musl-dev \
    && pip3 install pipenv

# create the virtualenv
ENV VIRTUAL_ENV=/opt/venv \
    PIPENV_VERBOSITY=-1
RUN python3 -m virtualenv $VIRTUAL_ENV

# copy over the common library
WORKDIR /opt/powerpi/controllers/harmony
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/harmony/Pipfile* ./
RUN pipenv install --three --deploy --ignore-pipfile

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine AS build-image
WORKDIR /usr/src/app
COPY --from=compile-image /opt/venv ./venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# add the application
COPY controllers/harmony/harmony_controller ./harmony_controller/

# start the application once the container is ready
CMD python -m harmony_controller

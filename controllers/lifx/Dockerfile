FROM python:3.8.10-alpine3.12 AS build-image
LABEL description="Python application to listen to the queue and turn LIFX devices on/off as requested"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc musl-dev \
    && pip3 install pipenv

# copy over the common library
WORKDIR /opt/powerpi/controllers/lifx
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/lifx/Pipfile* ./
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --three --deploy

# use multi-stage build to remove compile dependencies
FROM python:3.8.10-alpine3.12 AS run-image
ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="Europe/London"
WORKDIR /usr/src/app
RUN adduser --disabled-password powerpi
USER powerpi
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/lifx/.venv ./venv

# add the application
COPY --chown=powerpi controllers/lifx/lifx_controller ./lifx_controller/

# start the application once the container is ready
CMD python -m lifx_controller

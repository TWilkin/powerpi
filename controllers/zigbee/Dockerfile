FROM python:3.9.2-alpine3.12 AS build-image
LABEL description="Python application to control and respond to Zigbee devices"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc musl-dev \
    && pip3 install pipenv

# copy over the common library
WORKDIR /opt/powerpi/controllers/zigbee
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/zigbee/Pipfile* ./
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --three --deploy --ignore-pipfile

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine3.12 AS run-image
WORKDIR /usr/src/app
RUN adduser --disabled-password powerpi \
    && addgroup powerpi dialout
USER powerpi
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/zigbee/.venv ./venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# add the application
COPY --chown=powerpi controllers/zigbee/zigbee_controller ./zigbee_controller/

# start the application once the container is ready
CMD python -m zigbee_controller

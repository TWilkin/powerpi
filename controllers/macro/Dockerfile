FROM python:3.9.2-alpine3.12 AS build-image
LABEL description="Python application to listen to the queue and execute macro, and abstract devices as requested"

# ensure we have the dependencies to run pip
RUN apk add --no-cache gcc musl-dev \
    && pip3 install pipenv

# copy over the common library
WORKDIR /opt/powerpi/controllers/macro
COPY common/python/ ./../../common/python/

# install the dependencies
COPY controllers/macro/Pipfile* ./
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --three --deploy --ignore-pipfile

# use multi-stage build to remove compile dependencies
FROM python:3.9.2-alpine3.12 AS run-image
WORKDIR /usr/src/app
RUN adduser --disabled-password powerpi
USER powerpi
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/macro/.venv ./venv
ENV PATH="/usr/src/app/venv/bin:$PATH"

# add the application
COPY --chown=powerpi LICENSE ./
COPY --chown=powerpi controllers/macro/macro_controller ./macro_controller/

# start the application once the container is ready
CMD python -m macro_controller

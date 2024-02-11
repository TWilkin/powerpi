# create a common base image with updated setuptools
FROM python:3.11.8-slim-bookworm AS base-image
RUN pip3 install --prefer-binary setuptools==69.0.3

# create a base image for building
FROM base-image AS build-base-image
RUN pip3 install --prefer-binary poetry==1.7.1
RUN poetry config virtualenvs.in-project true
ENV CFLAGS=-fcommon

# create a venv with the common library
FROM build-base-image AS build-common-image
WORKDIR /opt/powerpi/common/python
COPY common/pytest/poetry.lock common/pytest/pyproject.toml ./../pytest/
COPY common/python/poetry.lock common/python/pyproject.toml ./
RUN poetry install --compile --only main --no-root --no-interaction --no-ansi
COPY common/python/powerpi_common ./powerpi_common
RUN poetry build \
    && .venv/bin/pip install ./dist/*.whl

# re-use the venv and install the controller's dependencies
FROM build-base-image AS build-image
WORKDIR /opt/powerpi/controllers/zigbee
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/zigbee/poetry.lock controllers/zigbee/pyproject.toml ./
RUN ln -s ../../common/python/.venv .venv \
    && poetry install --compile --only main --no-root --no-interaction --no-ansi

# use multi-stage build to remove compile dependencies
FROM base-image AS run-image
LABEL description="PowerPi ZigBee Controller"

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN adduser --disabled-password powerpi \
    && usermod -a -G dialout powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/zigbee/.venv ./venv

# add the application
COPY --chown=powerpi controllers/zigbee/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/zigbee/zigbee_controller ./zigbee_controller/

# start the application once the container is ready
CMD python -m zigbee_controller

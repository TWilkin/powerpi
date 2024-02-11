# create a common base image with updated setuptools
FROM python:3.11.8-slim-bookworm AS base-image
RUN pip3 install --prefer-binary setuptools==69.0.3

# create a base image for building
FROM base-image AS build-base-image
RUN pip3 install --prefer-binary poetry==1.7.1
RUN poetry config virtualenvs.in-project true
ENV CFLAGS=-fcommon

# build the common library
FROM build-base-image AS build-common-image
WORKDIR /opt/powerpi/common/python
COPY common/python/poetry.lock common/python/pyproject.toml ./
RUN poetry install --only main --no-root --no-directory --no-interaction --no-ansi
COPY common/python/powerpi_common ./powerpi_common
RUN poetry build

# install the controller's dependencies
FROM build-base-image AS build-image
WORKDIR /opt/powerpi/controllers/harmony
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/harmony/poetry.lock controllers/harmony/pyproject.toml ./
RUN poetry install --compile --only main --no-root --no-directory --no-interaction --no-ansi

# install the common library
COPY --from=build-common-image /opt/powerpi/common/python/dist/*.whl .
RUN .venv/bin/pip install ./*.whl \
    && rm -- *.whl

# use multi-stage build to remove compile dependencies
FROM base-image AS run-image
LABEL description="PowerPi Logitech Harmony Controller"

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN adduser --disabled-password powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/harmony/.venv ./venv

# add the application
COPY --chown=powerpi controllers/harmony/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/harmony/harmony_controller ./harmony_controller/

# start the application once the container is ready
CMD python -m harmony_controller

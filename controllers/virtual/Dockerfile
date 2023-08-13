# create a common base image with updated setuptools
FROM python:3.9.17-alpine3.18 AS base-image
RUN pip3 install -i https://www.piwheels.org/simple/ --extra-index-url https://pypi.org/simple/ --prefer-binary setuptools==68.0.0

# create a base image for building
FROM base-image AS build-base-image
RUN pip3 install -i https://www.piwheels.org/simple/ --extra-index-url https://pypi.org/simple/ --prefer-binary poetry==1.5.1
RUN poetry config virtualenvs.in-project true
ENV CFLAGS=-fcommon

# create a venv with the common library
FROM build-base-image AS build-common-image
WORKDIR /opt/powerpi/common/python
COPY common/pytest/poetry.lock common/pytest/pyproject.toml ./../pytest/
COPY common/python/poetry.lock common/python/pyproject.toml ./
RUN poetry source add --priority=default piwheels https://www.piwheels.org/simple/ \
    && poetry lock --no-update \
    && poetry install --only main --no-root --no-interaction --no-ansi
COPY common/python/powerpi_common ./powerpi_common
RUN poetry build \
    && .venv/bin/pip install ./dist/*.whl

# re-use the venv and install the controller's dependencies
FROM build-base-image AS build-image
WORKDIR /opt/powerpi/controllers/virtual
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/virtual/poetry.lock controllers/virtual/pyproject.toml ./
RUN ln -s ../../common/python/.venv .venv \
    && poetry source add --priority=default piwheels https://www.piwheels.org/simple/ \
    && poetry lock --no-update \
    && poetry install --only main --no-root --no-interaction --no-ansi

# use multi-stage build to remove compile dependencies
FROM base-image AS run-image
LABEL description="PowerPi Virtual Controller"

RUN apk add --no-cache libc6-compat

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN adduser --disabled-password powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/virtual/.venv ./venv

# add the application
COPY --chown=powerpi controllers/virtual/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/virtual/virtual_controller ./virtual_controller/

# start the application once the container is ready
CMD python -m virtual_controller

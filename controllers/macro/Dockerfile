# create a base image for building
FROM python:3.9.5-alpine3.12 AS build-base-image
RUN pip3 install -i https://www.piwheels.org/simple/ --extra-index-url https://pypi.org/simple/ --prefer-binary poetry==1.2.0
RUN poetry config virtualenvs.in-project true
ENV CFLAGS=-fcommon

# create a venv with the common library
FROM build-base-image AS build-common-image
WORKDIR /opt/powerpi/common/python
COPY common/pytest/poetry.lock common/pytest/pyproject.toml ./../pytest/
COPY common/python/poetry.lock common/python/pyproject.toml ./
RUN poetry source add --default piwheels https://www.piwheels.org/simple/ \
    && poetry lock --no-update \
    && poetry install --only main --no-root --no-interaction --no-ansi
COPY common/python/powerpi_common ./powerpi_common
RUN poetry build \
    && .venv/bin/pip install ./dist/*.whl

# re-use the venv and install the controller's dependencies
FROM build-base-image AS build-image
WORKDIR /opt/powerpi/controllers/macro
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/macro/poetry.lock controllers/macro/pyproject.toml ./
RUN ln -s ../../common/python/.venv .venv \
    && poetry source add --default piwheels https://www.piwheels.org/simple/ \
    && poetry lock --no-update \
    && poetry install --only main --no-root --no-interaction --no-ansi

# use multi-stage build to remove compile dependencies
FROM python:3.9.5-alpine3.12 AS run-image
LABEL description="PowerPi Macro Controller"

RUN apk add --no-cache libc6-compat

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN adduser --disabled-password powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/macro/.venv ./venv

# add the application
COPY --chown=powerpi controllers/macro/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/macro/macro_controller ./macro_controller/

# start the application once the container is ready
CMD python -m macro_controller

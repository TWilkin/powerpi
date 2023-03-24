# create a base image for building
FROM python:3.9.16-alpine3.17 AS build-base-image
RUN apk add --no-cache gcc git musl-dev
RUN pip3 install -i https://www.piwheels.org/simple/ --extra-index-url https://pypi.org/simple/ --prefer-binary poetry==1.4.1
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
WORKDIR /opt/powerpi/controllers/energenie
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/energenie/poetry.lock controllers/energenie/pyproject.toml ./
RUN ln -s ../../common/python/.venv .venv \
    && poetry source add --default piwheels https://www.piwheels.org/simple/ \
    && poetry lock --no-update \
    && poetry install --only main --no-root --no-interaction --no-ansi

# re-compile the binary
WORKDIR /opt/powerpi/controllers/energenie/.venv/lib/python3.9/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c

# use multi-stage build to remove compile dependencies
FROM python:3.9.16-alpine3.17 AS run-image
LABEL description="PowerPi Energenie Controller"

RUN apk add --no-cache libc6-compat

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN addgroup -g 997 -S gpio \
    && adduser --disabled-password powerpi \
    && addgroup powerpi gpio
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/energenie/.venv ./venv

# add the application
COPY --chown=powerpi controllers/energenie/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/energenie/energenie_controller ./energenie_controller/

# start the application once the container is ready
CMD python -m energenie_controller

# create a common base image
FROM python:3.11.11-slim-bookworm AS base-image
RUN pip install --upgrade pip==25.3

# create a base image for building
FROM base-image AS build-base-image
RUN pip3 install --prefer-binary poetry==2.1.1
RUN poetry config virtualenvs.in-project true

FROM build-base-image AS build-base-image-gcc
RUN apt-get update \
    && apt-get install -y gcc git \
    && apt-get clean -y

# build the common library
FROM build-base-image AS build-common-image
WORKDIR /opt/powerpi/common/python
COPY common/python/poetry.lock common/python/pyproject.toml ./
COPY common/python/powerpi_common ./powerpi_common
RUN poetry build

# install the controller's dependencies
FROM build-base-image-gcc AS build-image
WORKDIR /opt/powerpi/controllers/energenie
COPY controllers/energenie/poetry.lock controllers/energenie/pyproject.toml ./
RUN poetry install --compile --only main --no-root --no-directory --no-interaction --no-ansi

# Ugly fix for #479 where RPi.GPIO isn't working on Bookworm hosts 
RUN sed -i 's/from . import cleanup_GPIO//g' /opt/powerpi/controllers/energenie/.venv/lib/python3.11/site-packages/pyenergenie/__init__.py

# install the common library
COPY --from=build-common-image /opt/powerpi/common/python/dist/*.whl .
RUN .venv/bin/pip install ./*.whl \
    && rm -- *.whl

# re-compile the binary
WORKDIR /opt/powerpi/controllers/energenie/.venv/lib/python3.11/site-packages/pyenergenie/energenie/drv
RUN rm radio_rpi.so \
    && gcc -Wall -shared -o radio_rpi.so -fPIC radio.c hrfm69.c spis.c gpio_rpi.c delay_posix.c \
    && rm build* -- *.h *.c

# use multi-stage build to remove compile dependencies
FROM base-image AS run-image
LABEL description="PowerPi Energenie Controller"

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

RUN addgroup --gid 993 gpio \
    && adduser --disabled-password powerpi \
    && usermod -a -G gpio powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/energenie/.venv ./venv

# add the application
COPY --chown=powerpi controllers/energenie/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/energenie/energenie_controller ./energenie_controller/

# start the application once the container is ready
CMD ["python", "-m", "energenie_controller"]

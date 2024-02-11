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
WORKDIR /opt/powerpi/controllers/network
COPY --from=build-common-image /opt/powerpi/common ./../../common
COPY controllers/network/poetry.lock controllers/network/pyproject.toml ./
RUN poetry install --compile --only main --no-root --no-directory --no-interaction --no-ansi

# install the common library
COPY --from=build-common-image /opt/powerpi/common/python/dist/*.whl .
RUN .venv/bin/pip install ./*.whl \
    && rm -- *.whl

# use multi-stage build to remove compile dependencies
FROM base-image AS run-image
LABEL description="PowerPi Network Controller"

ENV PATH="/usr/src/app/venv/bin:$PATH"
ENV TZ="UTC"

# ensure the controller can run ping
RUN apt-get update \
    && apt-get install -y libcap2-bin \
    && apt-get clean -y
RUN setcap cap_net_raw+ep /usr/local/bin/python3.11

RUN adduser --disabled-password powerpi
USER powerpi

WORKDIR /usr/src/app
COPY --from=build-image --chown=powerpi /opt/powerpi/controllers/network/.venv ./venv

# add the application
COPY --chown=powerpi controllers/network/pyproject.toml LICENSE ./
COPY --chown=powerpi controllers/network/network_controller ./network_controller/

# start the application once the container is ready
CMD python -m network_controller

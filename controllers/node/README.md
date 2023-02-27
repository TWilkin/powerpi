# PowerPi - Node Controller

PowerPi service which monitors the nodes in the docker cluster as well as supporting UPS using a [PiJuice](https://www.pijuice.com) and a PWM fan. This service runs on each node of the cluster, and will produce events relating to this node, as well as checking if the other nodes are on/off.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports the following devices:

-   **Node** - A node in the docker cluster with the following optional hardware:
    -   [PiJuice](https://www.pijuice.com) UPS.
    -   PWM Fan e.g. [Noctua NF-A4x20 5V PWM](https://noctua.at/en/nf-a4x20-5v).

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **I2C_DEVICE** - The path to the I2C device on the host, if you're using an original Pi you'll want to change this to _/dev/i2c-0_ as the bus id was changed with later revisions.(default _/dev/i2c-1_).
-   **I2C_ADDRESS** - The I2C address of the PiJuice on the bus (default _0x14_).
-   **DEVICE_FATAL** - Whether to kill the service if it's unable to communicate with the [PiJuice](https://www.pijuice.com) device or PWM fan, useful when debugging off the Raspberry Pi but should be true in production. (default _false_).
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../../services/clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **EVENTS_FILE** - When _USE_CONFIG_FILE_ is true, load the _events.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../../services/clacks-config/README.md) pages.

-   [devices.json](../../services/clacks-config/README.md#devicesjson)
-   [events.json](../../services/clacks-config/README.md#eventsjson)

### Kubernetes

When running this service in Kubernetes, _microk8s_ needs to know which node has the [PiJuice](https://www.pijuice.com) or PWM fan device. The following command will add a label to the node `NODE_NAME` which should host this service.

```bash
microk8s kubectl label node NODE_NAME powerpi-pijuice=true
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/node directory in your PowerPi checkout
# Needs to be set so the correct PiJuice library is built
export PIJUICE_BUILD_BASE=1

# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/node directory in your PowerPi checkout
# Needs to be set so the correct PiJuice library is built
export PIJUICE_BUILD_BASE=1

# Download the dependencies
poetry install

# Run the service locally
poetry run python -m node_controller
```

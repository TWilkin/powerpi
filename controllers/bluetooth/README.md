# PowerPi - Bluetooth Controller

PowerPi service which controls [Bluetooth](https://en.wikipedia.org/wiki/Bluetooth) devices using a bluetooth transceiver (like the one built into a Pi 3+).

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports the following Bluetooth devices:

-   Bluetooth enabled Mobile Phone - Used for presence detection, when the phone comes into range this controller will broadcast a `detected` message, when the phone goes out of range it will broadcast an `undetected` message.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../../services/clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **EVENTS_FILE** - When _USE_CONFIG_FILE_ is true, load the _events.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../../services/clacks-config/README.md) pages.

-   [devices.json](../../services/clacks-config/README.md#devicesjson)
-   [events.json](../../services/clacks-config/README.md#eventsjson)

### Docker

When running this service in Docker Swarm using the `docker-compose.yaml` file via [_device-mapper_](../../services/device-mapper/README.md), docker needs to know which node has the Bluetooth device. The following command will add a label to the node `NODE_NAME` which should host this service.

```bash
docker node update --label-add bluetooth=true NODE_NAME
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/bluetooth directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/bluetooth directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m bluetooth_controller
```

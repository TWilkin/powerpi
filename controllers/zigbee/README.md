# PowerPi - ZigBee Controller

PowerPi service which controls [ZigBee](https://en.wikipedia.org/wiki/Zigbee) devices over the local ZigBee network. This controller requires a ZigBee interface, currently only supporting those that are supported by the [zigpy-znp](https://github.com/zigpy/zigpy-znp) library.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports the following ZigBee devices:

-   [Aqara Door and Window Sensor](https://www.aqara.com/en/door_and_window_sensor.html) - Magnetic door and window sensor supporting open and close events as well as battery life.
-   Osram Smart+ Switch Mini - ZigBee remote with 3 buttons (centre, up and down) supporting single and long press.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **ZIGBEE_DEVICE** - The path to the ZigBee device on the host (default _/dev/ttyACM0_).
-   **DATABASE_PATH** - The path to the database which contains the ZigBee network configuration (default _/var/data/zigbee.db_).
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../../clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **EVENTS_FILE** - When _USE_CONFIG_FILE_ is true, load the _events.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../../clacks-config/README.md) pages.

-   [devices.json](../../clacks-config/README.md#devicesjson)
-   [events.json](../../clacks-config/README.md#eventsjson)

### Docker

When running this service in Docker Swarm using the `docker-compose.yaml` file via [_device-mapper_](../../device-mapper/README.md), docker needs to know which node has the ZigBee device. The following command will add a label to the node `NODE_NAME` which should host this service.

```bash
docker node update --label-add zigbee=true NODE_NAME
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/zigbee directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/zigbee directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m zigbee_controller
```

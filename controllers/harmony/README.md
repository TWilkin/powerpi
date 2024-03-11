# PowerPi - Logitech Harmony Controller

PowerPi service which controls [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html) devices over the local network.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service supports the following Logitech Harmony devices (any including a WiFi smart hub):

-   [Harmony Elite](https://www.logitech.com/en-gb/products/harmony/harmony-elite.html)
-   [Harmony Companion](https://www.logitech.com/en-gb/products/harmony/harmony-companion.html)
-   [Harmony Hub](https://www.logitech.com/en-gb/products/harmony/harmony-hub.html)

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_config-server_](../../services/config-server/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.

### Configuration Files

This service requires one configuration file, as described in the following [_config-server_](../../services/config-server/README.md) page.

-   [devices.json](../../services/config-server/README.md#devicesjson)

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/harmony directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/harmony directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m harmony_controller
```

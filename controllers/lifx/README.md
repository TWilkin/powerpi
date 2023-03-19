# PowerPi - LIFX Controller

PowerPi service which controls [LIFX](https://www.lifx.com/) devices over the local network.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports LIFX lights that support the LIFX LAN protocol, supporting colour and temperature control. The following devices have been directly tested:

-   LIFX Mini Day & Dusk
-   LIFX Mini White

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../../services/clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **EVENTS_FILE** - When _USE_CONFIG_FILE_ is true, load the _events.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../../services/clacks-config/README.md) pages.

-   [devices.json](../../services/clacks-config/README.md#devicesjson)
-   [events.json](../../services/clacks-config/README.md#eventsjson)

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/lifx directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/lifx directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m lifx_controller
```

# PowerPi - Scheduler

PowerPi service which adjusts the temperature, colour, brightness and on/off status of light devices via a schedule.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **SCHEDULES_FILE** - When _USE_CONFIG_FILE_ is true, load the _schedules.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../clacks-config/README.md) pages.

-   [devices.json](../clacks-config/README.md#devicesjson)
-   [schedules.json](../clacks-config/README.md#schedulesjson)

## Testing

This service can be tested by executing the following commands.

```bash
# From the services/scheduler directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the services/scheduler directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m scheduler
```

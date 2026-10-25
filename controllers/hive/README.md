# PowerPi - Logitech Hive Controller

PowerPi service which controls [Hive](https://www.hivehome.com/) devices using the API.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service supports the following Hive devices:

- [Hive Thermostat](https://www.hivehome.com/shop/smart-heating/hive-thermostat) - Hive Thermostat supporting temperature reading, target temperature, heating mode and boost. Currently only reading is supported.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

- **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
- **DEVICES_FILE** - Load the _devices.json_ from this path.
- **HIVE_USERNAME** - The email address of the user to authenticate with the Hive API. This needs to be the owner account, not a guest account.
- **HIVE_SECRET_FILE** - The path to the file containing the password for the Hive user.

### Configuration Files

This service requires one configuration file, as described in the following [_config-server_](../../services/config-server/README.md) page.

- [devices.json](../../services/config-server/README.md#devicesjson)

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/hive directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/hive directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m hive_controller
```

# PowerPi - Light Fantastic

PowerPi service which adjusts the temperature, colour, brightness and on/off status of light devices via a schedule.

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../../common/node/common/README.md) which needs to be compiled before use.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **SCHEDULES_FILE** - When _USE_CONFIG_FILE_ is true, load the _schedules.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../clacks-config/README.md) pages.

-   [devices.json](../clacks-config/README.md#devicesjson)
-   [schedules.json](../clacks-config/README.md#schedulesjson)

## Testing

There are currently no automated tests for this service.

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common library
yarn build:common

# Run the service locally
yarn start:light-fantastic
```

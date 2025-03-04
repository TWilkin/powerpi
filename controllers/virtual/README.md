# PowerPi - Virtual Controller

PowerPi service which controls virtual devices, which are used to combine real devices provided by the other controllers.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller provides the following virtual devices:

-   **Condition** - Send an on or off command to the specified device only if the condition (specified in `on_condition` and `off_condition` respectively) is satisfied. For example this is useful if a device is connected to a remote socket and it cannot turn on until that socket is enabled.
-   **Delay** - Wait for the specified interval for turn on or turn off. Used if a device takes a few seconds to start-up, and we don't want the next step to happen before it's ready.
-   **Group** - Group several devices together so they can be turned on/off together (in the order they are defined), as well as have additional settings applied in a group (e.g. brightness).
-   **Log** - A device used for testing, will simply output the specified log message when turned on or off.
-   **Mutex** - A device that will ensure all the devices in the off device specification are off before attempting to turn the devices in the on device specification, akin to a mutually exclusive lock, the on devices cannot be on if the off devices are on.
-   **Scene** - A device that will send additional state (brightness, colour temperature, hue or saturation) to another device when switched on. The other device will remember its previous state which it will revert to when the scene is turned off.
-   **Variable** - A device that provides an on/off switch, which can be used in conditions for events, and the `Condition` device. An example would be to only switch a light on, if the variable is true, allowing automations to be disabled.

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
# From the controllers/virtual directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/virtual directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m virtual_controller
```

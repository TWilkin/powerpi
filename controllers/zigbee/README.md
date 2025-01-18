# PowerPi - ZigBee Controller

PowerPi service which controls [ZigBee](https://en.wikipedia.org/wiki/Zigbee) devices over the local ZigBee network. This controller requires a ZigBee interface, currently only supporting those that are supported by the [zigpy-znp](https://github.com/zigpy/zigpy-znp) library.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports the following ZigBee devices/sensors:

-   Lights - Any ZigBee standard compliant light bulb; the following bulbs have been tested and confirmed working:
    -   [Innr Smart Bulb Colour](https://www.innr.com/en/product/innr-smart-bulb-colour-b22-uk/) - Innr RGB light bulb.
-   Sockets - Any ZigBee standard compliant socket; the following sockets have been tested and confirmed working:
    -   [Innr Smart Plug](https://www.innr.com/en/product/innr-smart-plug-uk/) - Innr Smart Plug
-   Energy Monitoring - Any ZigBee standard compliant energy monitoring sensor producing power, current and voltage readings; the following sensors have been tested and confirmed working:
    -   [Innr Smart Plug](https://www.innr.com/en/product/innr-smart-plug-uk/) - Innr Smart Plug
-   [Aqara Door and Window Sensor](https://www.aqara.com/en/door_and_window_sensor.html) - Magnetic door and window sensor supporting open and close events as well as battery life.
-   Osram Smart+ Switch Mini - ZigBee remote with 3 buttons (centre, up and down) supporting single and long press as well as battery life.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **ZIGBEE_DEVICE** - The path to the ZigBee device on the host (default _/dev/ttyACM0_).
-   **DATABASE_PATH** - The path to the database which contains the ZigBee network configuration (default _/var/data/zigbee.db_).
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_config-server_](../../services/config-server/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.

### Configuration Files

This service requires one configuration file, as described in the following [_config-server_](../../services/config-server/README.md) page.

-   [devices.json](../../services/config-server/README.md#devicesjson)

### Kubernetes

When running this service in Kubernetes, _microk8s_ works out which node has the ZigBee device automatically, so no labelling is needed.

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

# PowerPi - Energenie Controller

PowerPi service which controls [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories) devices using the [ENER314](https://energenie4u.co.uk/catalogue/product/ENER314) or [ENER314-RT](https://energenie4u.co.uk/catalogue/product/ENER314-RT) Raspberry Pi modules.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

Unfortunately at this time this service is not compatible with a Pi 5 host due to changes in the way GPIO is accessed. If/when the underlying library is updated to support it, this will be rectified.

## Supported Devices

This controller requires one of the following Raspberry Pi modules to wirelessly communicate with the other Energenie devices:

-   [ENER314-RT](https://energenie4u.co.uk/catalogue/product/ENER314-RT) - Two Way Pi-mote, preferred option, supports two way communication and up to 16 devices.
-   [ENER314](https://energenie4u.co.uk/catalogue/product/ENER314) - Pi-mote control board, one way communication, no support for MiHome and just one supported device.

This controller service currently supports the following Energenie devices:

-   [ENER002](https://energenie4u.co.uk/catalogue/product/ENER002) - Individual Remote Control Socket
-   [ENER010](https://energenie4u.co.uk/catalogue/product/ENER010) - 4 Way Radio Controlled Extension Lead

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **ENERGENIE_DEVICE** - Which Energenie controller board to use, either ENER314 or ENER314-RT (default _ENER314-RT_).
-   **DEVICE_FATAL** - Whether to kill the service if it's unable to communicate with the Energenie device, useful when debugging off the Raspberry Pi but should be true in production. (default _false_).
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_config-server_](../../services/config-server/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.

### Configuration Files

This service requires one configuration file, as described in the following [_config-server_](../../services/config-server/README.md) page.

-   [devices.json](../../services/config-server/README.md#devicesjson)

### Kubernetes

When running this service in Kubernetes, _microk8s_ needs to know which node has the ENER314 or ENER314-RT device. The following command will add a label to the node `NODE_NAME` which should host this service.

```bash
microk8s kubectl label node NODE_NAME powerpi-energenie=true
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/energenie directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/energenie directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m energenie_controller
```

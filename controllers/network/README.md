# PowerPi - Network Controller

PowerPi service which controls devices over the local network.

The service is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local common library [_powerpi_common_](../../common/python/README.md), and testing library [_powerpi_common_test_](../../common/pytest/README.md).

## Supported Devices

This controller service currently supports networked computers (or other devices) that support the WOL protocol and respond to ping requests.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

- **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
- **DEVICES_FILE** - Load the _devices.json_ from this path.

### Configuration Files

This service requires one configuration file, as described in the following [_config-server_](../../services/config-server/README.md) page.

- [devices.json](../../services/config-server/README.md#devicesjson)

### Kubernetes

When running this service in Kubernetes, it uses `hostNetwork` to send Wake-on-LAN magic packets. This means its traffic originates from the node IP rather than a pod IP. To allow the network controller to access MQTT, ensure the cluster node subnet(s) are included in the `mosquitto.localCIDR` configuration.

## Testing

This service can be tested by executing the following commands.

```bash
# From the controllers/network directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the controllers/network directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the service locally
poetry run python -m network_controller
```

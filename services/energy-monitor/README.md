# PowerPi - Energy Monitor

PowerPi service retrieving gas and electricity usage from UK smart meter data collection service [N3rgy](http://www.n3rgy.com/).

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../../common/node/common/README.md) which needs to be compiled before use.

## Grant N3rgy access

To use this service you must first grant [N3rgy](http://www.n3rgy.com/) access to your gas and electricity smart meter data. This is simply a case of going to their [consumer portal](https://data.n3rgy.com/consumer/home) and providing the id of your smart meter.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **IHD_SECRET_FILE** - The path to a file which contains the IHD (In Home Device) MAC address, which is used to authenticate against N3rgy. In the form _00-00-00-00-00-00-00-00_.
-   **MAXIMUM_THRESHOLD** - The maximum value to publish in a message, used to prevent large erroneous values from affecting chart scales (default _undefined_).
-   **MESSAGE_WRITE_DELAY** - The number of milliseconds to wait between publishing each message, to ensure we don't overwhelm the message queue (default _100_).

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
yarn start:energy-monitor
```

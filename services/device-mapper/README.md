# PowerPi - Device Mapper

PowerPi service for starting a controller when it requires privileged access to a physical device connected to a [Docker Swarm](https://docs.docker.com/engine/swarm/) node. Utilises docker-in-docker to start the controller container attached to the PowerPi docker network with the appropriate access.

Used by the following controllers to access hardware hosted by the _docker_ node:

-   [_bluetooth_controller_](../../controllers/bluetooth/README.md) to access the Bluetooth transceiver.
-   [_energenie_controller_](../../controllers/energenie/README.md) to access the ENER314/ENER314-RT Raspberry Pi module.
-   [_zigbee_controller_](../../controllers/zigbee/README.md) to access the ZigBee serial device.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **ENV** - A colon (:) delimited list of environment variables to pass to the launched container. e.g. _ENERGENIE_DEVICE=ENER314-RT:DEVICE_FATAL=true_.
-   **CONTROLLER_NAME** - The prefix name for the docker container once it starts.
-   **IMAGE** - The image URL to pull the controller image from.
-   **DEVICE** - The optional path to a device connected to the node.
-   **VOLUME** - The optional path to a docker volume to connect to the docker container.

## Testing

There are currently no automated tests for this service.

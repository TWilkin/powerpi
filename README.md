# PowerPi

Home automation microservice stack communicating via MQTT (using [mosquitto](https://mosquitto.org/)) built with Typescript, Python, Go and [NodeMCU](https://en.wikipedia.org/wiki/NodeMCU) C deployable with [Kubernetes](https://kubernetes.io/) on a [Raspberry Pi](https://www.raspberrypi.com/) cluster.

This project was devised to utilise open, reverse engineered or free home automation hardware and software together without the need for third-party hubs, cloud services or subscriptions wherever possible.

### Supported IoT Hardware

-   [Amazon Alexa](https://developer.amazon.com/en-GB/alexa/devices)
-   [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories)
-   [LIFX](https://www.lifx.com/)
-   [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html)
-   [NodeMCU](https://en.wikipedia.org/wiki/NodeMCU)
-   [PiJuice](https://www.pijuice.com)
-   [ZigBee](https://en.wikipedia.org/wiki/Zigbee)

### Supported Services

-   [FreeDNS](https://freedns.afraid.org/)
-   [N3rgy](http://www.n3rgy.com/)

## Getting Started

The project is split into the following services, each of which have their own _README_ describing the configuration interface they support as well as how to modify and test them.

-   [**config-server**](services/config-server/README.md) - Retrieve configuration files from GitHub.
-   **controllers**:
    -   [**energenie**](controllers/energenie/README.md) - Allows control of [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories) devices using the ENER314 or ENER314-RT Pi module.
    -   [**harmony**](controllers/harmony/README.md) - Allows control of [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html) Smart Hub devices.
    -   [**lifx**](controllers/lifx/README.md) - Allows control of [LIFX](https://www.lifx.com/) light devices.
    -   [**macro**](controllers/macro/README.md) - Allows control of other devices with macros, delays, mutexes etc.
    -   [**network**](controllers/network/README.md) - Allows control of LAN (Local Area Network) devices.
    -   [**node**](controllers/node/README.md) - Allows monitoring of the cluster (Kubernetes) nodes and support for UPS using a [PiJuice](https://www.pijuice.com).
    -   [**zigbee**](controllers/zigbee/README.md) - Allows control of [ZigBee](https://en.wikipedia.org/wiki/Zigbee) devices and sensors.
-   [**deep-thought**](services/deep-thought/README.md) - API
-   [**energy-monitor**](services/energy-monitor/README.md) - Retrieve electricity and gas consumption in 30-minute blocks from UK smart meter submissions via [N3rgy](http://www.n3rgy.com/).
-   [**freedns**](services/freedns/README.md) - Overcome changing public IP addresses of consumer ISPs by pointing a free hostname at the current public IP via [FreeDNS](https://freedns.afraid.org/)
-   [**persistence**](services/persistence/README.md) - Service for writing all the messages that appear in the MQTT message queue to a database.
-   [**scheduler**](services/scheduler/README.md) - Schedule based control of light devices, e.g. brightness, colour, temperature etc.
-   [**ui**](services/ui/README.md) - NGINX hosting the UI.
-   [**voice-assistant**](services/voice-assistant/README.md) - Integration with Amazon Alexa skill to receive voice commands.

The project includes a [_shutdown_](services/shutdown/README.md) service which allows a computer to be remotely shutdown by message queue events generated by PowerPi, this is used by the [_node_](controllers/node/README.md) controller to shutdown the cluster node when the battery has insufficient charge.

The project also includes sensor NodeMCU code in the [_sensors_](sensors/README.md) directory which can be used to generate events when motion is detected, or temperature/humidity readings at an interval.

## Building

The latest image for each service can be found on [Docker Hub](https://hub.docker.com/u/twilkin), if you've made local changes (or want to try out a service locally) you can build it from scratch with the following instructions.

The images can be built with Docker's [_buildx_](https://docs.docker.com/buildx/working-with-buildx/) tool which supports cross-compilation of images, allowing us to build ARM images for deployment on a Raspberry Pi on an x86_64 architecture. Although, if you're not using Energenie, or PiJuice and therefore don't need the Pi module you can build and run the stack on other architectures supported by the base images.

```bash
# From the root of your checkout of PowerPi
# Build an image with buildx, the image version tags can be found in the service's package.json or pyproject.toml file.
docker buildx build --platform linux/arm/v7 --push -t MY_DOCKER_REGISTRY/powerpi-config-server:1.0.0 -f services/config-server/Dockerfile .

# Or for 64-bit ARM
docker buildx build --platform linux/arm64 --push -t MY_DOCKER_REGISTRY/powerpi-config-server:1.0.0 -f services/config-server/Dockerfile .

# Or x86-64
docker buildx build --platform linux/amd64 --push -t MY_DOCKER_REGISTRY/powerpi-config-server:1.0.0 -f services/config-server/Dockerfile .
```

## Deployment

Deploying the services is simply a matter of deploying the stack using Kubernetes, which will pull the latest images from [Docker Hub](https://hub.docker.com/u/twilkin).

The instructions for deploying the stack using Kubernetes can be found as follows:

-   [Kubernetes](kubernetes/README.md)

## Authors

-   **Tom Wilkin** - Most of what you see - [TWilkin](https://github.com/TWilkin)
-   **Paul Sandwell** - Testing, feedback and some excellent ideas - [peasandwell](https://github.com/peasandwell)
-   **Camila Neyra** - Some excellent ideas, specifically floorplans, and putting up with my incessant home automation talk.

See also the list of [contributors](https://github.com/TWilkin/powerpi/contributors) who participated in this project.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details

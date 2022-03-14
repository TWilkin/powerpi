# PowerPi

Home automation microservice stack communicating via MQTT (using [mosquitto](https://mosquitto.org/)) built with Typescript, Python and [NodeMCU](https://en.wikipedia.org/wiki/NodeMCU) C deployable with [Docker Swarm](https://docs.docker.com/engine/swarm/) on a [Raspberry Pi](https://www.raspberrypi.com/) cluster.

This project was devised to utilise open, reverse engineered or free home automation hardware and software together without the need for third-party hubs, cloud services or subscriptions wherever possible.

### Supported IoT Hardware

-   [Amazon Alexa](https://developer.amazon.com/en-GB/alexa/devices)
-   [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories)
-   [LIFX](https://www.lifx.com/)
-   [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html)
-   [NodeMCU](https://en.wikipedia.org/wiki/NodeMCU)
-   [ZigBee](https://en.wikipedia.org/wiki/Zigbee)

### Supported Services

-   [FreeDNS](https://freedns.afraid.org/)
-   [N3rgy](http://www.n3rgy.com/)

## Getting Started

The project is split into the following services, each of which have their own _README_ describing the configuration interface they support as well as how to modify and test them.

-   [**babel-fish**](babel-fish/README.md) - Integration with Amazon Alexa skill to receive voice commands.
-   [**certbot**](certbot/README.md) - Use Let's Encrypt to provide SSL certificates for NGINX.
-   [**clacks-config**](clacks-config/READEME.md) - Retrieve configuration files from GitHub.
-   **controllers**:
    -   [**energenie**](controllers/energenie/README.md) - Allows control of [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories) devices using the ENER314 or ENER314-RT Pi module.
    -   [**harmony**](controllers/harmony/README.md) - Allows control of [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html) Smart Hub devices.
    -   [**lifx**](controllers/lifx/README.md) - Allows control of [LIFX](https://www.lifx.com/) light devices.
    -   [**macro**](controllers/macro/README.md) - Allows control of other devices with macros, delays, mutexes etc.
    -   [**zigbee**](controllers/zigbee/README.md) - Allows control of [ZigBee](https://en.wikipedia.org/wiki/Zigbee) devices and sensors.
-   [**deep-thought**](deep-thought/README.md) - API
-   [**device-mapper**](device-mapper/README.md) - Workaround for accessing system devices using privileged mode in Docker Swarm mode using Docker-in-docker.
-   [**energy-monitor**](energy-monitor/README.md) - Retrieve electricity and gas consumption in 30-minute blocks from UK smart meter submissions via [N3rgy](http://www.n3rgy.com/).
-   [**freedns**](freedns/README.md) - Overcome changing public IP addresses of consumer ISPs by pointing a free hostname at the current public IP via [FreeDNS](https://freedns.afraid.org/)
-   [**light-fantastic**](light-fantastic/README.md) - Schedule based control of light devices (LIFX), e.g. brightness, colour, temperature etc.
-   [**nginx**](nginx/README.md) - NGINX acts as a proxy to _deep-thought_ and _babel-fish_ as well as hosting the UI.
-   [**persistence**](persistence/README.md) - Service for writing all the messages that appear in the MQTT message queue to a database.

The project also includes sensor NodeMCU code in the [_esp8266_](esp8266/README.md) directory which can be used to generate events when motion is detected, or temperature/humidity readings at an interval.

## Building

The images can be build with Docker's [_buildx_](https://docs.docker.com/buildx/working-with-buildx/) tool which supports cross-compilation of images, allowing us to build ARM images for deployment on a Raspberry Pi on an x86_64 architecture. Although, if you're not using Energenie, and therefore don't need the Pi module you can build and run the stack on other architectures supported by the base images.

```bash
# From the root of your checkout of PowerPi
# Build an image with buildx, the image version tags can be found in docker/docker-compose.yaml
docker buildx build --platform linux/arm/v7 --push -t MY_DOCKER_REGISTRY/powerpi/clacks-config:0.0.2 -f clacks-config/Dockerfile .
```

## Deployment

Deploying the services is simply a matter of building images with docker, and deploying the stack using docker-compose.

The deployment expects the network to already be created and deployed, this is to allow the docker-in-docker container for [_device-mapper_](device-mapper/README.md) to join any created pods to the network.

```bash
# Create powerpi docker network
docker network create --driver=overlay --attachable powerpi
```

The deployment also expects the following secrets to already exist, they are described as follows and can be created with this command where _SECRET_NAME_ is the name of the specific secret and _/path/to/secret/file_ is the file containing that secret:

```bash
# Create a secret
docker secret create powerpi_SECRET_NAME /path/to/secret/file
```

-   **powerpi_freedns** - The password to update the DNS record for your user in [FreeDNS](https://freedns.afraid.org/).
-   **powerpi_db** - The password for the PostgreSQL database if using persistence, recommended to generate a strong password for this.
-   **powerpi_google_auth** - The Google OAuth secret used for login authentication in the API, UI and _babel-fish_.
-   **powerpi_jwt_auth** - The JWT signing secret used during authentication, recommended to generate a strong password for this.
-   **powerpi_session** - The session signing secret used between the UI and API, recommended to generate a strong password for this.
-   **powerpi_oauth** - The OAuth secret for the client used to map the Google tokens to PowerPi tokens, recommended to generate a strong password for this.
-   **powerpi_ihd** - The MAC address of your smart energy meter IHD (In Home Device) for use with _energy-monitor_.
-   **powerpi_github** - A GitHub personal access token which allows _clacks-config_ to retrieve configuration files from a GitHub repository.

Finally once the network and secrets are created, the docker images built the stack can be deployed:

```bash
# From the root of your checkout of PowerPi
# Deploy stack
docker stack deploy -c docker/docker-compose.yaml powerpi
```

## Authors

-   **Tom Wilkin** - Most of what you see - [TWilkin](https://github.com/TWilkin)
-   **Paul Sandwell** - Testing, feedback and some excellent ideas - [peasandwell](https://github.com/peasandwell)

See also the list of [contributors](https://github.com/TWilkin/powerpi/contributors) who participated in this project.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details

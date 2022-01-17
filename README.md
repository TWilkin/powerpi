# PowerPi

Home automation microservice stack communicating via MQTT built with Node.js, Python and Arduino C deployable with Docker Swarm on Raspberry Pi.

### Supported IoT Hardware

-   [Amazon Alexa](https://developer.amazon.com/en-GB/alexa/devices)
-   [Arduino](https://www.arduino.cc/)
-   [Energenie MiHome](https://energenie4u.co.uk/catalogue/category/Raspberry-Pi-Accessories)
-   [LIFX](https://www.lifx.com/)
-   [Logitech Harmony](https://www.logitech.com/en-gb/products/harmony.html)

### Supported Services

-   [FreeDNS](https://freedns.afraid.org/)
-   [N3rgy](http://www.n3rgy.com/)

## Getting Started

The project is split into the following services, each of which have their own _README_ describing the configuration interface they support as well as how to modify and test them.

-   **babel-fish** - Integration with Amazon Alexa skill to receive voice commands.
-   **certbot** - Use Let's Encrypt to provide SSL certificates for NGINX.
-   **clacks-config** - Retrieve configuration files from GitHub.
-   **controllers**:
    -   **energenie** - Allows control of Energenie MiHome devices using the ENER314 or ENER314-RT Pi module.
    -   **harmony** - Allows control of Logitech Harmony devices.
    -   **lifx** - Allows control of LIFX devices.
    -   **macro** - Allows control of other devices with macros, delays, mutexes etc.
-   **deep-thought** - API
-   **device-mapper** - Workaround for accessing Raspberry Pi _/dev/gpiomem_ in Docker Swarm mode using Docker-in-docker.
-   **energy-monitor** - Retrieve electricity and gas consumption in 30-minute blocks from UK smart meter submissions via [N3rgy](http://www.n3rgy.com/).
-   **freedns** - Overcome changing public IP addresses of consumer ISPs by pointing a free hostname at the current public IP via [FreeDNS](https://freedns.afraid.org/)
-   **light-fantastic** - Schedule based control of light devices (LIFX), e.g. brightness, colour temperature etc.
-   [**nginx**](nginx/README.md) - NGINX acts as a proxy to _deep-thought_ and _babel-fish_ as well as hosting the UI.
-   **persistence** - Service for writing all the messages that appear in the MQTT message queue to a database.

The project also includes sensor Arduino code in the _esp8266_ directory which can be used to generate events when motion is detected, or temperature/humidity data at an interval.

## Building

The images can be build with Docker's _buildx_ tool which supports cross-compilation of images, allowing us to build ARM images for deployment on a Raspberry Pi on an x86_64 architecture. Although, if you're not using Energenie, and therefore don't need the Pi module you can build and run the stack on other architectures supported by the base images.

```bash
# Build an image with buildx, the image version tags can be found in docker/docker-compose.yml
# From the root of your checkout of PowerPi
docker buildx build --platform linux/arm/v7 --push -t MY_DOCKER_REGISTRY/powerpi/clacks-config:0.0.2 -f clacks-config/Dockerfile .
```

## Deployment

Deploying the services is simply a matter of building images with docker, and deploying the stack using docker-compose.

The deployment expects the network to already be created and deployed, this is to allow the docker-in-docker container for _device-mapper_ to join any created pods to the network.

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
# Deploy stack
docker stack deploy -c docker/docker-compose.yml powerpi
```

## Authors

-   **Tom Wilkin** - Most of what you see - [TWilkin](https://github.com/TWilkin)
-   **Paul Sandwell** - Testing, feedback and the occasional good idea - [peasandwell](https://github.com/peasandwell)

See also the list of [contributors](https://github.com/TWilkin/powerpi/contributors) who participated in this project.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details

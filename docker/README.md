# PowerPi - Docker Swarm Deployment

Deploying the services is simply a matter of deploying the stack using docker-compose (specifically [Docker Swarm](https://docs.docker.com/engine/swarm/)), which will pull the latest images from [Docker Hub](https://hub.docker.com/u/twilkin).

## Setup

The deployment expects the network to already be created and deployed, this is to allow the docker-in-docker container for [_device-mapper_](services/device-mapper/README.md) to join any created pods to the network.

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

## Deploying

Finally once the network and secrets are created, the stack can be deployed:

```bash
# From the root of your checkout of PowerPi
# Deploy stack
docker stack deploy -c docker/docker-compose.yaml powerpi
```

## Updating

When changes have been made to PowerPi the images will be updated on [Docker Hub](https://hub.docker.com/u/twilkin); updating is simply a case of downloading the latest version of this repository and re-running the deploy step.

```bash
# From the root of your checkout of PowerPi
# Update stack
docker stack deploy --prune -c docker/docker-compose.yaml powerpi
```

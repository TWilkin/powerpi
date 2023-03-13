# PowerPi - Kubernetes Deployment

Deploying the services is simply a matter of deploying the stack using Kubernetes (specifically [microk8s](https://microk8s.io/)), which will pull the latest images from [Docker Hub](https://hub.docker.com/u/twilkin).

## Setup

### Enable Plugins

The deployment utilises several Kubernetes plugins to configure the stack, each of these is explained below with the relevant enable command which will need to be run to enable it.

```bash
# Disable high-availability as it prevents the certificate from working
microk8s disable ha-cluster --force

# DNS is required to allow the services to find eachother dynamically
# where __NAMESERVER__ is the IP address of the name server you would like to use, probably your router so DNS lookups for devices work inside the cluster
microk8s enable dns -- __NAMESERVER__

# ingress is required to allow incoming requests to the cluster for the UI, API or voice assistant integration.
microk8s enable ingress

# cert-manager is needed when utilising the UI, API or voice assistant integration to get HTTPS using an SSL certificate
microk8s enable cert-manager

# hostpath-storage is needed by default if no alternative storage class is provided instead
microk8s enable hostpath-storage

# metallb is needed to provide access to the message queue from outside the cluster (i.e. for sensors to generate messages)
# when enabling this a prompt will be shown asking for the IP address range for the load-balancer
microk8s enable metallb
```

### Add Secrets

The deployment expects the following secrets to already exist, they are described as follows and can be created with this command where _SECRET_NAME_ is the name of the specific secret and _/path/to/secret/file_ is the file containing that secret:

-   **freedns-secret** - The password to update the DNS record for your user in [FreeDNS](https://freedns.afraid.org/).

```bash
microk8s kubectl create secret generic freedns-secret --namespace powerpi \
    --from-literal username=__USERNAME__ \
    --from-from=password=./__SECRET_NAME__
```
-   **google-auth-secret** - The Google OAuth secret used for login authentication in the API, UI and _babel-fish_.

```bash
microk8s kubectl create secret generic google-auth-secret --namespace powerpi \
    --from-literal client_id=__CLIENT_ID__ \
    --from-from=secret=./__SECRET_NAME__
```

-   **ihd-secret** - The MAC address of your smart energy meter IHD (In Home Device) for use with _energy-monitor_.

```bash
microk8s kubectl create secret generic ihd-secret --namespace powerpi \
    --from-from=ihd=./__SECRET_NAME__
```

-   **github-secret** - A GitHub personal access token which allows _clacks-config_ to retrieve configuration files from a GitHub repository.

```bash
microk8s kubectl create secret generic github-secret --namespace powerpi \
    --from-literal username=__USERNAME__ \
    --from-from=password=./__SECRET_NAME__
```

### Add Labels

Several of the services use node labels to identify which node in the cluster have the connected device that they want to use. The following command will add a label to the node `NODE_NAME` which should host the _mosquitto_ and _database_ services, as both require to be on the same node due to their persistent storage configuration.

```bash
microk8s kubectl label node NODE_NAME powerpi-storage=true
```

The following services also utilise labels, if you wish to use any of these apply their labels as well:

-   [energenie-controller](../controllers/energenie/README.md#kubernetes) - ENER314/ENER314-RT Pi controller
-   [node-controller](../controllers/node/README.md#kubernetes)- PiJuice/PWM fan controller

## Customisation

When deploying the stack, you'll want to customise some of the options to configure the environment for your home automation needs.

Have a look at the options in [values.yaml](./values.yaml) as these are the options that can be overridden in your own file and provided using the `-f my-override.yaml` file when deploying the stack.

## Deploying

Finally once the plugins are enabled, labels added and the secrets have been created, the stack can be deployed (where _OVERRIDE_ is the path to your overriding YAML configuration file):

```bash
# From the root of your checkout of PowerPi
cd kubernetes

# Deploy your stack
microk8s helm upgrade --install --namespace powerpi --create-namespace -f __OVERRIDE__ powerpi .
```

## Updating

When changes have been made to PowerPi the images will be updated on [Docker Hub](https://hub.docker.com/u/twilkin); updating is simply a case of downloading the latest version of this repository and re-running the deploy step (where _OVERRIDE_ is the path to your overriding YAML configuration file).

```bash
# From the root of your checkout of PowerPi
cd kubernetes

# Update your stack
microk8s helm upgrade --install --namespace powerpi -f __OVERRIDE__ powerpi .
```

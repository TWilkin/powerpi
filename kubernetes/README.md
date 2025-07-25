# PowerPi - Kubernetes Deployment

Deploying the services is simply a matter of deploying the stack using Kubernetes (specifically [microk8s](https://microk8s.io/)), which will pull the latest images from [Docker Hub](https://hub.docker.com/u/twilkin).

## Setup

### Enable Plugins

The deployment utilises several Kubernetes plugins to configure the stack, each of these is explained below with the relevant enable command which will need to be run to enable it.

```bash
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

# after enabling all the services it's recommended to restart otherwise you may have issues with ingress not working
reboot
```

## Customisation

When deploying the stack, you'll want to customise some of the options to configure the environment for your home automation needs.

Have a look at the options in [values.yaml](./values.yaml) as these are the options that can be overridden in your own file and provided using the `-f my-override.yaml` file when deploying the stack.

Some of the options are outlined below:
Options in a sublist should be represented in YAML as such:

```yaml
global:
    clusterIssuer: letsencrypt

mosquitto:
    hostName: powerpi.mydomain.com
```

- **global**:
    - **clusterIssuer** - The name of a [`ClusterIssuer`](https://cert-manager.io/docs/concepts/issuer/) deployed in Kubernetes that should be used for retrieving SSL certificates, default is _null_.
    - **storageClass** - The name of a [`StorageClass`](https://kubernetes.io/docs/concepts/storage/storage-classes/) deployed in Kuberenetes that should be used when creating persistent storage for services that require this, default is _null_ which will use a custom hostpath class. Can be defined per service instead of globally if different classes are required per service. Effective for `mosquitto`, `database` and [`zigbee-controller`](../controllers/zigbee/README.md) services.
- **mosquitto**:
    - **hostName** - The hostname to utilise in SSL certificates for outside (i.e. sensors/`shutdown` service) cluster connections to MQTT. Requires the global `clusterIssuer` option to be set. Default is _null_.

## Deploying

Finally once the plugins are enabled, the stack can be deployed by adding the Helm repository and deploying the stack (where _OVERRIDE_ is the path to your overriding YAML configuration file):

```bash
# Add the helm repo for PowerPi
microk8s helm repo add powerpi https://twilkin.github.io/powerpi

# Deploy your stack
microk8s helm upgrade --install --namespace powerpi --create-namespace -f __OVERRIDE__ powerpi powerpi/powerpi
```

## Updating

When changes have been made to PowerPi the images will be updated on [Docker Hub](https://hub.docker.com/u/twilkin); updating is simply a case of downloading the latest version of the helm repository and re-running the deploy step (where _OVERRIDE_ is the path to your overriding YAML configuration file).

```bash
# Update the helm repo for PowerPi
microk8s helm repo update

# Deploy your stack
microk8s helm upgrade --install --namespace powerpi -f __OVERRIDE__ powerpi powerpi/powerpi
```

### Add Secrets

The deployment expects the following secrets to already exist, they are described as follows and can be created with this command where _SECRET_NAME_ is the name of the specific secret and _/path/to/secret/file_ is the file containing that secret:

- **google-auth-secret** - The Google OAuth secret used for login authentication in the API, UI and _voice-assistant_.

```bash
microk8s kubectl create secret generic google-auth-secret --namespace powerpi \
    --from-literal=client_id=__CLIENT_ID__ \
    --from-file=secret=./__SECRET_NAME__
```

- **octopus-api-secret** - The Octopus API key for use with _energy-monitor_.

```bash
microk8s kubectl create secret generic octopus-api-secret --namespace powerpi \
    --from-file=key=./__SECRET_NAME__
```

- **github-secret** - A GitHub personal access token which allows _config-server_ to retrieve configuration files from a GitHub repository.

```bash
microk8s kubectl create secret generic github-secret --namespace powerpi \
    --from-literal=username=__USERNAME__ \
    --from-file=password=./__SECRET_NAME__
```

### Add Labels

Several of the services use node labels to identify which node in the cluster have the connected device that they want to use. The following command will add a label to the node `NODE_NAME` which should host the _mosquitto_ and _database_ services, as both require to be on the same node due to their persistent storage configuration.

```bash
microk8s kubectl label node NODE_NAME powerpi-storage=true
```

The following service also utilises labels, if you wish to use this apply their labels as well:

- [`energenie-controller`](../controllers/energenie/README.md#kubernetes) - ENER314/ENER314-RT Pi controller

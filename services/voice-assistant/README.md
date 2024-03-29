# PowerPi - Voice Assistant

PowerPi service which provides [Amazon Alexa](https://developer.amazon.com/en-GB/alexa/devices) voice support to PowerPi. Amazon can access this service via the Kubernetes ingress rules when a port forwarding rule is applied on your router, as well as an SSL certificate using Let's Encrypt.

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../../common/node/common/README.md), a common API library [_@powerpi/common-api_](../../common/node/common-api/README.md) and a common testing library [_@powerpi/common-test_](../../common/node/common-test/README.md), all of which need to be compiled before use.

An example to turn the device "BedroomLight" on would be:

```
User: alexa start power pi
Alexa: What would you like to do?
User: turn bedroom light on
Alexa: Turning Bedroom Light on
```

## Building

### Locally

The service can be built locally with the following commands, which will generate the bundles in the _voice-assistant/dist_ directory.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common libraries
yarn build:lib

# Build the voice-assistant service
yarn build:voice-assistant
```

### Docker

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

### Alexa Model

The code repository already contains the compiled Alexa model for configuring the skill, however this needs to be rebuild (and checked in) if any changes to the model are made. This can be achieved with the following commands. The updated model will be available at _voice-assistant/build/platform-alexa_.

```bash
# Ensure you have the Jovo CLI installed, which will be used to compile the Alexa model
npm install --location=global @jovotech/cli

# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common libraries
yarn build:lib

# Build the voice-assistant Alexa model
yarn build:voice-assistant:alexa
```

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

-   **API_ADDRESS** - The URI to the _API_ instance to use, (default _http://api:3000/api_)
-   **JOVO_PORT** - The port the service runs on (default _3000_).
-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, (default _mqtt://POWERPI_URL:1883_)

## Testing

This service can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common libraries
yarn build:lib

# Run the service locally
yarn test:voice-assistant
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common libraries
yarn build:lib

# Run the service locally
yarn start:voice-assistant
```

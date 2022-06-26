# PowerPi - FreeDNS

PowerPi service for updating a [FreeDNS](https://freedns.afraid.org/) record of the public IP address of a dynamic IP address from a home broadband Internet connection.

The service is built using typescript, with dependencies using yarn workspaces.

## Open FreeDNS Account

To use this service you must first register with [FreeDNS](https://freedns.afraid.org/) for a free Dynamic DNS account.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **FREEDNS_USER** - The user registered with FreeDNS.
-   **FREDNS_PASSWORD** - The path to a file containing the password for the user registered with FreeDNS.

## Testing

There are currently no automated tests for this service.

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Run the service locally
yarn start:freedns
```

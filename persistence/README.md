# PowerPi - Persistence

PowerPi service which writes all broadcast MQTT messages by the other services to a database. These messages can then be retrieved by [_deep-thought_ (API)](../deep-thought/README.md) to show history, and charts of sensor data in the UI.

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../common/node/common/README.md) which needs to be compiled before use.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../README.md#Building).

## Configuration

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **DB_USER** - The user to log into the database as (default _powerpi_).
-   **DB_SECRET_FILE** - The path to a file containing the database password.
-   **DB_HOST** - The host name of the server running the database (default _db_).
-   **DB_PORT** - The port to connect to the database on (default _5432_).
-   **DB_SCHEMA** - The schema containing the database (default _powerpi_).

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
yarn start:persistence
```

# PowerPi - Deep Thought (API)

PowerPi service which provides the API for communicating with the MQTT message queue, and the _persistence_ database to both the UI and _babel-fish_ services.

The API is not directly accessible, as NGINX acts as a reverse proxy.

Authentication is handled utilising Google social login.

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../../common/node/common/README.md) and a common API library [_@powerpi/api_](../../common/node/api/README.md), both of which need to be compiled before use.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **EXTERNAL_HOST_NAME** - The domain name that certbot used to generate a certificate for, this is the base address the API uses for authentication redirects.
-   **EXTERNAL_PORT** - The port number that NGINX is running on via the port forwarding of the router, this is the port the API uses for authentication redirects.
-   **DB_USER** - The user to log into the database as (default _powerpi_).
-   **DB_SECRET_FILE** - The path to a file containing the database password.
-   **DB_HOST** - The host name of the server running the database (default _db_).
-   **DB_PORT** - The port to connect to the database on (default _5432_).
-   **DB_SCHEMA** - The schema containing the database (default _powerpi_).
-   **GOOGLE_CLIENT_ID** - The client id for the Google social login configuration.
-   **GOOGLE_SECRET_FILE** - The path to the secret associated with the client id for the Google social login configuration.
-   **JWT_SECRET_FILE** - The path to a secret that is used to generate JWT tokens, this can be anything but ensure it's a long confidential string.
-   **SESSION_SECRET_FILE** - The path to a secret that is used to encrypt sessions, this can be anything but ensure it's a long confidential string.
-   **OAUTH_CLIENT_ID** - The client id registered with Amazon for _babel-fish_.
-   **OAUTH_SECRET_FILE** - The path to the secret associated with the client id registered with Amazon for _babel-fish_.
-   **USE_CONFIG_FILE** - Use local config files instead of the files downloaded from GitHub by [_clacks-config_](../clacks-config/README.md) (default _false_).
-   **DEVICES_FILE** - When _USE_CONFIG_FILE_ is true, load the _devices.json_ from this path.
-   **USERS_FILE** - When _USE_CONFIG_FILE_ is true, load the _users.json_ from this path.

### Configuration Files

This service requires two configuration files, both of which are described on the following [_clacks-config_](../clacks-config/README.md) pages.

-   [devices.json](../clacks-config/README.md#devicesjson)
-   [floorplan.json](../clacks-config/README.md#floorplanjson)
-   [users.json](../clacks-config/README.md#usersjson)

## Testing

There are currently no automated tests for this service.

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the api and common library
yarn build:api
yarn build:common

# Run the service locally
yarn start:deep-thought
```

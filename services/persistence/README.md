# PowerPi - Persistence

PowerPi service which writes all broadcast MQTT messages by the other services to a database. These messages can then be retrieved by the [_API_](../api/README.md) to show history, and charts of sensor data in the UI.

The service is built using Go, it is dependant on a local common library [_common_](../../common/go/README.md).

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

- **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
- **DB_USER** - The user to log into the database as (default _powerpi_).
- **DB_SECRET_FILE** - The path to a file containing the database password.
- **DB_HOST** - The host name of the server running the database (default _db_).
- **DB_PORT** - The port to connect to the database on (default _5432_).
- **DB_SCHEMA** - The schema containing the database (default _powerpi_).

The service takes the following command line arguments:

```
--databaseHost string       The host for the database (default "db")
--databasePassword string   The file containing the password for the database (default "undefined")
--databasePort int          The port for the database (default 5432)
--databaseUser string       The username for the database (default "powerpi")
--host string               The hostname of the MQTT broker (default "mosquitto")
--logLevel string           The log level for the application (default "INFO")
--password string           The path to the password file (default "undefined")
--port int                  The port number for the MQTT broker (default 1883)
--topic string              The topic base for the MQTT broker (default "powerpi")
--user string               The username for the MQTT broker (default "device")
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
cd services/persistence

# Run the tests
make test
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
cd services/persistence/src

# Show the help file which will tell you the command line options, as explained above
go run github.com/TWilkin/powerpi/persistence --help
```

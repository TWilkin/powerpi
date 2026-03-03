# PowerPi - Energy Monitor

PowerPi service retrieving gas and electricity usage from UK energy provider [Octopus](https://developer.octopus.energy/rest/guides/endpoints).

The service is built using Go, it is dependant on a local common library [_common_](../../common/go/README.md).

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using kubernetes these are already configured in the helm chart, however when running locally for testing we need to define these:

- **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
- **OCTOPUS_API_KEY_FILE** - The path to a file which contains the Octopus API key, which is used to authenticate against Octopus.
- **MESSAGE_WRITE_DELAY** - The number of milliseconds to wait between publishing each message, to ensure we don't overwhelm the message queue (default _100_).

The service takes the following command line arguments:

```
--history int               The number of days to collect data for, when there is no existing data in the message
                            queue. (default 30)
--host string               The hostname of the MQTT broker (default "mosquitto")
--log-level string          The log level for the application (default "INFO")
--messageWriteDelay int32   The number of milliseconds to wait between publishing each message, to ensure we don't
                            overwhelm the message queue. (default 100)
--octopusApiKey string      The path to the Octopus API key file (default "undefined")
--password string           The path to the password file (default "undefined")
--port int                  The port number for the MQTT broker (default 1883)
--topic string              The topic base for the MQTT broker (default "powerpi")
--user string               The username for the MQTT broker (default "device")
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
cd services/energy-monitor

# Run the tests
make test
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
cd services/energy-monitor/src

# Show the help file which will tell you the command line options, as explained above
go run powerpi/energy-monitor --help
```

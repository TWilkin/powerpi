# PowerPi - Shutdown Service

PowerPi shutdown service runs on a computer which you would like PowerPi to be able to control, (like those that can be started with wake-on-LAN using the [_network_controller_](../../controllers/network/README.md)).

The service also supports limited additional state as follows.

- Writing a brightness value to a file to adjust the brightness of an LED/Display (e.g. [Raspberry Pi Touch Display 2](https://www.raspberrypi.com/products/touch-display-2/))

The service is built using Go, it is dependant on a local common library [_common_](../../common/go/README.md).

## Building

The service can be built using the provided Makefile and the following commands:

```bash
# From the root of your PowerPi checkout
cd services/shutdown

# For a 64-bit Linux ARM binary
make TARGET_ARCH=arm64

# For a 32-bit Linux ARM binary
make TARGET_ARCH=arm

# For a 64-bit Linux binary
make TARGET_ARCH=amd64

# For a 32-bit Linux binary
make TARGET_ARCH=386
```

## Installing

This service also provides a _systemctl_ service script to allow it to be installed as a service on Linux, this can be installed as follows:

```bash
# From the root of your PowerPi checkout
cd services/shutdown

# First compile for your desired architecture
make TARGET_ARCH=arm64

# Copy the compiled binary to the computer
scp ./bin/powerpi_shutdown_linux_arm64 HOST:~/

# Edit the file powerpi-shutdown.service to set the --host parameter to your MQTT hostname, and --password parameter to the path on the host computer where the password file will be e.g. /root/.powerpi-password
scp ./powerpi-shutdown.service HOST:~/

# Now SSH into the computer to perform the install
# Copy the powerpi_shutdown binary you built earlier to the right place and make it executable
sudo mv ~/powerpi_shutdown_linux_arm64 /usr/local/powerpi_shutdown
sudo chmod +x /usr/local/powerpi_shutdown

# Get the password from kubernetes and set the permissions on the file
# Replace /root/.powerpi-password with the path you set in the previous step
kubectl get secrets -n powerpi mosquitto-device-secret --template={{.data.password}} | base64 --decode # note down this password
# Add the password from the previous step to this file
nano /root/.powerpi-password
chmod 600 /root/.powerpi-password

# Now we'll install the service
sudo mv ~/powerpi-shutdown.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable powerpi-shutdown.service
sudo systemctl start powerpi-shutdown.service

# To see the log entries for the service, you can view the journal
journalctl -t powerpi_shutdown
```

## Configuration

### Environment

The service takes the following command line arguments:

```
  -allowQuickShutdown
    	If true allow a message within 2 minutes of service starting to initiate a shutdown
  -brightnessDevice string
    	The path to the device to use for controller brightness, e.g. "/sys/class/backlight/10-0045/brightness" for a Pi Touch Display 2
  -brightnessMax float
    	The maximum value supported for the brightness setting, e.g. 31 for a Pi Touch Display 2 (default 100)
  -brightnessMin float
    	The minimum value supported for the brightness setting, e.g. 0 for a Pi Touch Display 2
  -host string
    	The hostname of the MQTT broker (default "localhost")
  -mock
    	Whether to actually shutdown or not
  -password string
    	The path to the password file (default "undefined")
  -port int
    	The port number for the MQTT broker (default 1883)
  -topic string
    	The topic base for the MQTT broker (default "powerpi")
  -user string
    	The username for the MQTT broker (default "device")
```

## Testing

This service can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
cd services/shutdown

# Run the tests
make test
```

## Local Execution

The service can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
cd services/shutdown/src

# Show the help file which will tell you the command line options, as explained above
go run powerpi/shutdown --help
```

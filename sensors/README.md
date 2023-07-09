# PowerPi - Sensors

Home Automation IoT sensors.

## Hardware

The code was written for the [ESP8266 NodeMCU development board](https://en.wikipedia.org/wiki/NodeMCU).

The following pins on the board are used for each different type of sensor

-   **deep-sleep** - _D0_ - _GPIO16_ connected to the _RST_ pin to support wake-up from deep sleep (only when PIR and button sensing is disabled in firmware).
-   **motion** - _D1_ - _GPIO5_ for the data pin of the PIR.
-   **temperature/humidity** - _D2_ - _GPIO4_ - for the data pin of the DHT22.

As follows is the circuit diagram for a sensor including both a PIR (motion) and DHT22 (temperature/humidity). Either can be omitted, which can be configured when building the firmware. This circuit diagram was created using [Circuit Diagram](https://www.circuit-diagram.org/editor/).
![PowerPi sensor circuit diagram](./circuit/circuit.svg)

**Note:** When flashing firmware you need to disconnect _D0_ from _RST_ on the microcontroller, otherwise the microcontroller will get stuck in a reset loop. If this connection is not made, when the firmware attempts to use deep-sleep it will not awaken after the timer period has elapsed. The deep-sleep functionality is only possible when the PIR and button sensors are disabled in the firmware, and the `--disable-deep-sleep` option is not passed when configuring.

## Building

Building the code requires having the Arduino IDE download to your environment and added to your path.

First we must generate the configure script.

```bash
# Add Arduino IDE to your path
PATH=$PATH:/path/to/arduino-ide

# Generate the configure script
autoconf
```

If MQTT uses authentication (this is the default behaviour), we need to capture the password for the `sensor` user so we can pass it when compiling the sensor firmware.

```bash
# Retrieve the sensor password from Kubernetes
kubectl get secrets -n powerpi mosquitto-sensor-secret --template={{.data.password}} | base64 --decode
```

Next, we need to configure the compiler with the options we wish to include, we also must set the following options in the form `name=value`.

-   **location** - Where this sensor will be deployed, e.g. _Bedroom_, _Office_, _Hallway_ etc.
-   **mqtt_server** - The IP address/hostname of the Docker stack that contains PowerPi.
-   **mqtt_port** - _optional_ - The port number for MQTT, default is _1883_.
-   **mqtt_user** - _optional_ - The username for MQTT, default is _sensor_.
-   **mqtt_password** - _optional_ - The password for MQTT, default is disabled. (This is the password retrieved from Kubernetes in the previous step)
-   **wifi_ssid** - The WiFi SSID the sensor should connect to.
-   **wifi_password** - The password for the aforementioned WiFi SSID.
-   **serial_baud** - _optional_ - The baud rate to use when connecting to the serial monitor on the sensor, default is 115200.

By default a sensor will retrieve configuration from [_config-server_](../services/config-server/README.md), but this can be disabled with the `--disable-config-server` option if you wish to always use the configuration options provided in the code.

```bash
# Configure a motion sensor
./configure --enable-pir location=Hallway

# Configure a temperature/humidity sensor
./configure --enable-dht22 location=Bedroom

# Configure a temperature/humidity sensor with button press support
./configure --enable-dht22 --enable-button location=Bedroom

# Configure a combined sensor
./configure --enable-dht22 --enable-pir --enable-button location=Office

# Configure a sensor that doesn't get configuration from config-server
./configure --enable-dht22 --disable-config-server location=Lounge

# Configure a sensor that doesn't use deep-sleep (for more timely events or when D0 is not connected to RST)
./configure --enable-dht22 --disable-deep-sleep location=Lounge
```

Finally we can compile and deploy the code, connect your NodeMCU to your computer with the USB cable and execute the following:

```bash
# Download Arduino libraries,
# compile the code,
# flash the ESP8266
# and start the serial monitor
make
```

### Configuration Files

This sensor uses a configuration file (if the `--disable-config-server` option is not included), which is described on the following [_config-server_](../services/config-server/README.md) page.

-   [devices.json](../services/config-server/README.md#devicesjson)

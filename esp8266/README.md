# PowerPi - Sensors

Home Automation IoT sensors.

## Hardware

The code was written for the [ESP8266 NodeMCU development board](https://en.wikipedia.org/wiki/NodeMCU).

The following pins on the board are used for each different type of sensor

-   **motion** - _D1_ - _GPIO5_ for the data pin of the PIR.
-   **temperature/humidity** - _D2_ - _GPIO4_ - for the data pin of the DHT22.

As follows is the circuit diagram for a sensor including both a PIR (motion) and DHT22 (temperature/humidity). Either can be omitted, which can be configured when building the firmware. This circuit diagram was created using [Circuit Diagram](https://www.circuit-diagram.org/editor/).
![PowerPi sensor circuit diagram](./circuit/circuit.svg)

## Building

Building the code requires having the Arduino IDE download to your environment and added to your path.

First we must generate the configure script.

```bash
# Add Arduino IDE to your path
PATH=$PATH:/path/to/arduino-ide

# Generate the configure script
autoconf
```

Next, we need to configure the compiler with the options we wish to include, we also must set the following options in the form `name=value`.

-   **location** - Where this sensor will be deployed, e.g. _Bedroom_, _Office_, _Hallway_ etc.
-   **mqtt_server** - The IP address/hostname of the Docker stack that contains PowerPi.
-   **mqtt_port** - _optional_ - The port number for MQTT, default is _1883_.
-   **wifi_ssid** - The WiFi SSID the sensor should connect to.
-   **wifi_password** - The password for the aforementioned WiFi SSID.
-   **serial_baud** - _optional_ - The baud rate to use when connecting to the serial monitor on the sensor, default is 115200.

```bash
# Configure a motion sensor
./configure --enable-pir location=Hallway

# Configure a temperature/humidity sensor
./configure --enable-dht22 location=Bedroom

# Configure a combined sensor
./configure --enable-dht22 --enable-pir location=Office
```

Finally we can compile and deploy the code, connect your NodeMCU to your computer with the USB cable and execute the following:

```bash
# Download Arduino libraries, compile the code, flash the ESP8266 and start the serial monitor
make
```

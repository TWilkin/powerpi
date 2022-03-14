# PowerPi - Clacks Config

PowerPi service which downloads the configuration files from GitHub on an interval, publishing the changed configuration files to the MQTT message queue notifying the other services that configuration has been modified.

The service is built using typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/common_](../common/node/common/README.md) which needs to be compiled before use.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **MQTT_ADDRESS** - The URI to the MQTT instance to use, e.g. _mqtt://POWERPI_URL:1883_
-   **GITHUB_USER** - The user name of the GitHub user that owns the repository containing the configuration files.
-   **GITHUB_SECRET_FILE** - The path to the secret containing the GitHub user token.
-   **REPO** - The repository under the _GITHUB_USER_ the contains the configuration (default _powerpi-config_).
-   **BRANCH** - The branch of the repository containing the configuration (default _master_).
-   **FILE_PATH** - The path in the repostiory contraining the configuration (default _""_).
-   **POLL_FREQUENCY** - The frequency at which to check GitHub for updated configuration files in seconds (default _300_).

### Configuration Files

This service will download the following files and publish them to the message queue if available and only when they change.

#### devices.json

The _devices.json_ file contains the list of devices that are added to PowerPi. The controllers use this configuration to define the devices and sensors that each of them support. The file takes the following format:

```json
{
    "devices": [
        {
            // the composite device allows control of multiple devices, in this case the single LogDevice
            "type": "composite",
            "name": "MyDevices",
            "display_name": "My Devices",
            "devices": ["LogDevice"],
            "visible": true
        },

        // a log device simply prints the message on turn on/off
        {
            "type": "log",
            "name": "LogDevice",
            "message": "This example file will simply print out this message when turning either device on or off",
            "visible": false
        }
    ],

    "sensors": [
        // a motion sensor will generate detected/undetected events when it detects, or does not detect motion
        {
            "type": "motion",
            "name": "MotionSensor",
            "location": "Hallway"
        },
        // example of the electricity meter configuration for the output from the energy-monitor service
        {
            "type": "electricity",
            "name": "ElectricityMeter",
            "location": "Hallway",
            "entity": "electricity",
            "action": "usage"
        }
    ]
}
```

#### events.json

The _events.json_ file contains the mapping of events (from sensors) to actions (affecting devices). The controllers use this configuration to define automated actions triggered by sensor generated events. The file takes the following format:

```json
{
    "listeners": [
        // listen to the topic powerpi/events/Hallway/motion
        // if an event { "message": "detected" } is published then change the state of MyDevices to on
        {
            "topic": "Hallway/motion",
            "events": [
                {
                    "action": { "device": "MyDevices", "state": "on" },
                    "condition": { "message": { "state": "detected" } }
                }
            ]
        }
    ]
}
```

#### floorplan.json

The _floorplan.json_ file contains a floorplan description of the home, which is used to generate a map in the UI showing where sensors are located, allowing selection of a room to see the sensor status for that room. The file takes the following format:

```json
{
    "floorplan": {
        "floors": [
            // repeat for each floor of your home
            {
                "name": "Ground",
                "rooms": [
                    // can define a non-uniform shaped room using the coordinates of the corners
                    {
                        "name": "LivingRoom",
                        "display_name": "Living Room",
                        "points": [
                            { "x": 0, "y": 0 },
                            { "x": 550, "y": 0 },
                            { "x": 550, "y": 410 },
                            { "x": 200, "y": 410 },
                            { "x": 200, "y": 300 },
                            { "x": 0, "y": 300 }
                        ]
                    },
                    // or define a simple square/rectangular room with width/height and an x/y offset
                    {
                        "name": "Hallway",
                        "y": 300,
                        "width": 200,
                        "height": 410
                    }
                ]
            }
        ]
    }
}
```

#### schedules.json

The _schedules.json_ file contains the scheduled events that _light-fantastic_ uses to adjust light brightness, temperature and colour throughout the day. The file takes the following format:

```json
{
    "timezone": "Europe/London",
    "schedules": [
        {
            // increase the brightness of MyDevices between 8am and 9am from 0 to 1000 in 60s intervals and turn the device on
            "device": "MyDevices",
            "days": ["Saturday", "Sunday"],
            "between": ["08:00:00", "09:00:00"],
            "interval": "60", // seconds
            "brightness": [0, 1000],
            "power": true
        }
    ]
}
```

#### users.json

The _users.json_ file contains the users who are authorised to use the _deep-thought_ API, and therefore the UI and _babel-fish_ services. The file takes the following format:

```json
{
    "users": [
        {
            // must be a registered account with Google
            "email": "me@gmail.com",
            // currently the only role is USER
            "role": "USER"
        }
    ]
}
```

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
yarn start:clacks-config
```

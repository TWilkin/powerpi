from enum import Enum

from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor.sensor import Sensor
from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterGeneralCommandListener, ZigbeeMixin


class OnOff(int, Enum):
    OFF = 0
    ON = 1


class AqaraDoorWindowSensor(Sensor, ZigbeeMixin):
    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        ieee: str,
        nwk: str,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, ieee, nwk)

        self.__logger = logger

        self.__register()

    def __str__(self):
        return ZigbeeMixin.__str__(self)

    def open_close_handler(self, on_off: OnOff):
        self.__logger.info(f'Received {on_off} from door/window sensor')

        state = None
        if on_off == OnOff.ON:
            state = 'open'
        elif on_off == OnOff.OFF:
            state = 'closed'

        if state:
            message = {"state": state}

            self._broadcast('change', message)

    def __register(self):
        device = self._zigbee_device

        # open/close
        device[1].in_clusters[6].add_listener(
            ClusterGeneralCommandListener(
                lambda _, args: self.open_close_handler(args[0][0].value.value)
            )
        )

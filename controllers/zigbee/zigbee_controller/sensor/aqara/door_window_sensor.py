from typing import List

from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.foundation import Attribute

from powerpi_common.config import Config
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.sensor.mixin.battery import BatteryMixin
from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterGeneralCommandListener, OnOff, ZigbeeMixin


class AqaraDoorWindowSensor(Sensor, ZigbeeMixin, PollableMixin, BatteryMixin):
    '''
    Adds support for Aqara Door/Window Sensor.
    Generates the following events on open/close.

    Open:
    /event/NAME/change:{"state": "open"}

    Close:
    /event/NAME/change:{"state": "close"}
    '''

    # pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        ieee: str,
        nwk: str,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, ieee, nwk)
        PollableMixin.__init__(self, config, **kwargs)

        self.__logger = logger

        self.__register()

    async def poll(self):
        pass

    def open_close_handler(self, on_off: OnOff):
        self.__logger.info(f'Received {on_off} from door/window sensor')

        state = None
        if on_off == OnOff.ON:
            state = 'open'
        elif on_off == OnOff.OFF:
            state = 'close'

        if state:
            message = {"state": state}

            self._broadcast('change', message)

    def __register(self):
        device = self._zigbee_device

        def parse(args: List[List[Attribute]]):
            attribute_id = OnOffCluster.attridx['on_off']

            for reports in args:
                try:
                    return reports[attribute_id].value.value
                except KeyError:
                    # this is probably the wrong report
                    pass

            return None

        # open/close
        device[1].in_clusters[OnOffCluster.cluster_id].add_listener(
            ClusterGeneralCommandListener(
                lambda _, args: self.open_close_handler(parse(args))
            )
        )

    def __str__(self):
        return ZigbeeMixin.__str__(self)

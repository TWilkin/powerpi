from typing import Any, Dict, List

from zigpy.zcl.clusters.general import Basic, OnOff as OnOffCluster
from zigpy.zcl.foundation import Attribute, TypeValue

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.sensor.mixin.battery import BatteryMixin
from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterAttributeListener, ClusterGeneralCommandListener, \
    OnOff, OpenClose, ZigbeeMixin


class AqaraDoorWindowSensor(Sensor, ZigbeeMixin, BatteryMixin):
    '''
    Adds support for Aqara Door/Window Sensor.
    Generates the following events on open/close.

    Open:
    /event/NAME/change:{"state": "open"}

    Close:
    /event/NAME/change:{"state": "close"}
    '''

    # the additional attribute id returned by this device
    AQARA_ATTRIBUTE = 0xFF01

    # the attribute id in AQARA_ATTRIBUTE for the battery mV level
    BATTERY_VOLTAGE_ATTRIBUTE = 1

    # the minimum expected voltage in mV
    MIN_VOLTAGE = 2820

    # the maximum expected voltage in mV
    MAX_VOLTAGE = 3100

    # pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

        self._logger = logger

    def open_close_handler(self, on_off: OnOff):
        self.log_info(f'Received {on_off} from door/window sensor')

        state = None
        if on_off == OnOff.ON:
            state = OpenClose.OPEN
        elif on_off == OnOff.OFF:
            state = OpenClose.CLOSE

        if state:
            message = {'state': state}

            self._broadcast('change', message)

    def on_attribute_updated(self, attribute_id: int, value: Any):
        if attribute_id == self.AQARA_ATTRIBUTE:
            additional_attributes: Dict[int, TypeValue] = {}

            # read the additional attributes from the binary response
            data = bytes(value, 'utf-8')
            while data not in (b'', b'\x00'):
                key = int(data[0])
                data_value, data = TypeValue.deserialize(data[1:])

                additional_attributes[key] = data_value.value

                self.log_debug(f'{key}: {additional_attributes[key]}')

                # we only care about the battery voltage
                if key == self.BATTERY_VOLTAGE_ATTRIBUTE:
                    break

            # if the battery voltage attribute is included
            if self.BATTERY_VOLTAGE_ATTRIBUTE in additional_attributes:
                voltage = additional_attributes[self.BATTERY_VOLTAGE_ATTRIBUTE]
                self.log_info(f'Received battery value of {voltage}mV')

                # ensure voltage is in the expected range
                voltage = max(voltage, self.MIN_VOLTAGE)
                voltage = min(voltage, self.MAX_VOLTAGE)

                # convert to a percentage
                multiplier = 100 / (self.MAX_VOLTAGE - self.MIN_VOLTAGE)
                percentage = round((voltage - self.MIN_VOLTAGE) * multiplier)

                self.on_battery_change(percentage)

    async def initialise(self):
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

        # battery status
        device[1].in_clusters[Basic.cluster_id].add_listener(
            ClusterAttributeListener(self.on_attribute_updated)
        )

    def __str__(self):
        return ZigbeeMixin.__str__(self)

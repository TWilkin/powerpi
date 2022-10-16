from asyncio import sleep
from typing import TypedDict, Union

from node_controller.pijuice import PiJuiceInterface
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin

PiJuiceConfig = TypedDict(
    'PiJuiceConfig',
    {'charge_battery': bool, 'wake_up_on_charge': int},
    total=False
)


class LocalNodeDevice(Device, InitialisableMixin, PollableMixin, BatteryMixin):
    # pylint: disable=too-many-ancestors
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        pijuice_interface: PiJuiceInterface,
        pijuice: Union[PiJuiceConfig, None] = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        BatteryMixin.__init__(self)

        self.__pijuice = pijuice_interface

        if pijuice is None:
            pijuice = PiJuiceConfig()

        self.__pijuice_config = PiJuiceConfig({
            'charge_battery': pijuice.get('charge_battery', True),
            'wake_up_on_charge': pijuice.get('wake_up_on_charge', 20)
        })

    async def initialise(self):
        self.__pijuice.charge_battery = self.__pijuice_config['charge_battery']
        self.__pijuice.wake_up_on_charge = self.__pijuice_config['wake_up_on_charge']

    async def deinitialise(self):
        # when shutting down the service, broadcast the device is off
        if self.state != DeviceStatus.OFF:
            self.state = DeviceStatus.OFF

            # have to wait for the message to broadcast
            await sleep(1)

    async def poll(self):
        if self.state != DeviceStatus.ON:
            self.state = DeviceStatus.ON

        level = self.__pijuice.battery_level
        if level is not None:
            charging = self.__pijuice.battery_charging
            self.on_battery_change(level, charging)

    async def _turn_on(self):
        raise NotImplementedError

    async def _turn_off(self):
        raise NotImplementedError

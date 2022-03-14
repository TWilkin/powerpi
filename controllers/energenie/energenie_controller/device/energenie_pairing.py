import asyncio

from typing import Any, Dict, List

from energenie_controller.config import EnergenieConfig
from energenie_controller.energenie import EnergenieInterface
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class EnergeniePairingDevice(Device):
    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: EnergenieConfig,
        logger: Logger,
        mqtt_client: MQTTClient,
        energenie: EnergenieInterface,
        timeout: float = 120,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__config = config
        self.__energenie = energenie
        self.__timeout = timeout

    def _turn_on(self):
        # run in a separate task so the off state happens after the on
        loop = asyncio.get_event_loop()
        loop.create_task(self.pair())

    def _turn_off(self):
        self.__energenie.stop_pair()

    async def pair(self):
        home_id = self.find_free_home_id()

        if home_id is not None:
            self.__energenie.set_ids(home_id, 0)

            # publish the message now as we have no idea when it'll pair
            topic = f'device/{self.name}/join'
            message = {'home_id': home_id}
            self._producer(topic, message)

            await self.__energenie.start_pair(self.__timeout)

        self.state = DeviceStatus.OFF

    def find_free_home_id(self):
        if not self.__config.is_ener314_rt:
            # ENER314 only supports home_id 0
            return 0

        # ENER314-RT supports 16 home ids
        home_ids = list(range(0, 17))

        devices: List[Dict[str, Any]] = self.__config.devices['devices']

        for device in devices:
            if device.get('type', '').startswith('energenie'):
                try:
                    home_ids.remove(device.get('home_id', None))
                except ValueError:
                    # fine if it's already removed
                    pass

        if len(home_ids) > 0:
            return home_ids[0]

        return None

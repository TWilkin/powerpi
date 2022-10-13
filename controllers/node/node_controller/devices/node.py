from node_controller.pijuice import PiJuiceInterface
from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin


class NodeDevice(Device, PollableMixin, BatteryMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        pijuice: PiJuiceInterface,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)

        self.__pijuice = pijuice

    async def poll(self):
        self.on_battery_change(
            self.__pijuice.battery_level,
            self.__pijuice.battery_charging
        )

    async def _turn_on(self):
        raise NotImplementedError

    async def _turn_off(self):
        raise NotImplementedError

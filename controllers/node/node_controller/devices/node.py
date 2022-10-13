from node_controller.pijuice import PiJuiceInterface
from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class NodeDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        pijuice: PiJuiceInterface,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__pijuice = pijuice

    async def _turn_on(self):
        raise NotImplementedError

    async def _turn_off(self):
        raise NotImplementedError

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.device.mixin import PollableMixin


class PresenceSensor(Sensor, PollableMixin):
    '''
    Add supports for detecting a device on the network for user presence detection,
    using ARP tables and ICMP ping.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        PollableMixin(self, config, **kwargs)

        self._logger = logger

    async def poll(self):
        pass

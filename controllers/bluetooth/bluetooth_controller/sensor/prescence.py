from bleak import BleakClient
from bluetooth_controller.bluetooth import BluetoothMixin
from powerpi_common.config import Config
from powerpi_common.device.mixin.pollable import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor import Sensor


class BluetoothPresenceSensor(Sensor, PollableMixin, BluetoothMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        BluetoothMixin.__init__(self, **kwargs)

        self._logger = logger

    async def poll(self):
        async def is_connected(client: BleakClient):
            return await client.is_connected()

        connected = await self._connect_and_execute(is_connected)

        if connected:
            self._logger.info('Connected')
        else:
            self._logger.info('Not connected')

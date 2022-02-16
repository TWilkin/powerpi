import asyncio

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from .device import Device


class AsyncDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, name, **kwargs)
    
    async def on_message(self, message: MQTTMessage, entity: str, action: str):
        async def handler():
            await Device.on_message(self, message, entity, action)
        
        loop = asyncio.get_event_loop()
        await loop.create_task(handler())

from powerpi_common.device import Device
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class ShutdownService:
    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
    ):
        self.__logger = logger

        self.__producer = mqtt_client.add_producer()

    async def shutdown(self, device: Device):
        self.__logger.info("Initiating shutdown")

        topic = f'device/{device.name}/change'
        message = {'state': DeviceStatus.OFF}
        self.__producer(topic, message)

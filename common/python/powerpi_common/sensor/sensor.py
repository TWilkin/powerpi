from powerpi_common.device.base import BaseDevice
from powerpi_common.mqtt import MQTTClient


class Sensor(BaseDevice):
    def __init__(
        self,
        mqtt_client: MQTTClient,
        name: str, 
        location: str,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False
    ):
        BaseDevice.__init__(self, name, display_name, visible)

        self.__location = location
        self.__entity = entity
        self.__action = action

        self._producer = mqtt_client.add_producer()
    
    def _broadcast(self, action: str, message: dict):
        entity = self.__entity if self.__entity is not None else self.__location
        action = action if action is not None else self.__action
        topic = f'event/{entity}/{action}'

        self._producer(topic, message)

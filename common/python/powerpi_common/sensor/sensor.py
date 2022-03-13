from typing import Union

from powerpi_common.device.base import BaseDevice
from powerpi_common.mqtt import MQTTClient


class Sensor(BaseDevice):
    '''
    Abstract base class for a "sensor", which supports reading data from a
    physical device, or receiving asynchronous events from a device and
    then broadcasting the data/events to the message queue.
    '''

    def __init__(
        self,
        mqtt_client: MQTTClient,
        location: Union[str, None] = None,
        entity: Union[str, None] = None,
        action: Union[str, None] = None,
        **kwargs
    ):
        BaseDevice.__init__(self, **kwargs)

        self.__location = location
        self.__entity = entity
        self.__action = action

        self._producer = mqtt_client.add_producer()

    def _broadcast(self, action: str, message: dict):
        entity = self.__entity if self.__entity is not None \
            else self.__location if self.__location is not None \
            else self._name

        action = action if action is not None else self.__action

        topic = f'event/{entity}/{action}'

        self._producer(topic, message)

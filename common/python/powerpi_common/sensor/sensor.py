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
        entity: str | None = None,
        action: str | None = None,
        **kwargs
    ):
        BaseDevice.__init__(self, **kwargs)

        self.__entity = entity
        self.__action = action

        self._producer = mqtt_client.add_producer()

    @property
    def entity(self):
        return self.__entity if self.__entity is not None else self._name

    def _broadcast(self, action: str, message: dict):
        action = action if action is not None else self.__action

        topic = f'event/{self.entity}/{action}'

        self._producer(topic, message)

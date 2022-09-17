from typing import Any, Dict, Union

from powerpi_common.config import Config
from powerpi_common.device.base import BaseDevice
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.initial_status_event_consumer import \
    SensorInitialStatusEventConsumer

SensorState = Dict[str, Any]


class Sensor(BaseDevice):
    '''
    Abstract base class for a "sensor", which supports reading data from a
    physical device, or receiving asynchronous events from a device and
    then broadcasting the data/events to the message queue.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        entity: Union[str, None] = None,
        action: Union[str, None] = None,
        **kwargs
    ):
        BaseDevice.__init__(self, **kwargs)

        self.__entity = entity
        self.__action = action
        self.__state = {}

        self._producer = mqtt_client.add_producer()

        # add listener to get the initial state from the queue, if there is one
        SensorInitialStatusEventConsumer(self, config, logger, mqtt_client)

    @property
    def entity(self):
        return self.__entity if self.__entity is not None else self._name

    @property
    def action(self):
        return self.__action

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: SensorState):
        self.__state = new_state

    def _broadcast(self, action: str, message: dict):
        action = action if action is not None else self.action

        topic = f'event/{self.entity}/{action}'

        self._producer(topic, message)

    def __str__(self):
        return f'{type(self).__name__}({self.display_name}, {self.state})'

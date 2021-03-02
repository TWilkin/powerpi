from abc import abstractmethod

from . mqtt import MQTTClient


class Device(object):
    def __init__(self, mqtt_client: MQTTClient, name: str):
        self._name = name
        self.__state = 'unknown'

        self._producer = mqtt_client.add_producer()

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state):
        self.__state = new_state

        # broadcast the state change
        topic = '{}/{}/{}'.format('device', self._name, 'status')
        message = {'state': self.__state}
        self._producer(topic, message)

    @abstractmethod
    def turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def turn_off(self):
        raise NotImplementedError

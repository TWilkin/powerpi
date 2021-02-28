from abc import abstractmethod


class Device(object):
    def __init__(self, name):
        self._name = name
        self._status = 'unknown'

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    @abstractmethod
    def turn_on(self):
        pass

    @abstractmethod
    def turn_off(self):
        pass

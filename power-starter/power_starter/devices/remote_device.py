from threading import Event

from power_starter.util.logger import Logger


class RemoteDevice(object):
    def __init__(self, client, name, **kwargs):
        self.__name = name
        self.__producer = client.add_producer()
        self.__status = 'unknown'
        self.__waiting = Event()

    @property
    def name(self):
        return self.__name

    @property
    def status(self):
        return self.__status

    @status.setter
    def status(self, new_status):
        self.update_status(new_status, False)

    @property
    def pollable(self):
        return False

    def update_status(self, new_status, _):
        self.__status = new_status
        self.__waiting.set()

    def turn_on(self):
        self.__send_message('on')

    def turn_off(self):
        self.__send_message('off')

    def __send_message(self, state):
        self.__producer(
            'powerpi/device/{}/change'.format(self.__name),
            {'state': state}
        )

        Logger.info(
            'Waiting for state update for device {}'.format(self.__name)
        )
        self.__waiting.clear()
        while not self.__waiting.is_set():
            self.__waiting.wait(12.5)

        Logger.info(
            'Continuing after device {}'.format(self.__name)
        )

    def __str__(self):
        return '<class \'power_starter.devices.remote_device.RemoteDevice\'>(%s, %s)' % (self.name, self.status)

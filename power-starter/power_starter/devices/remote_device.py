class RemoteDevice(object):
    def __init__(self, name, **kwargs):
        self.__name = name
        self.status = 'unknown'

    @property
    def name(self):
        return self.__name

    @property
    def pollable(self):
        return False

    def turn_on(self):
        pass

    def turn_off(self):
        pass

    def __str__(self):
        return '<class \'power_starter.devices.remote_device.RemoteDevice\'>(%s, %s)' % (self.name, self.status)

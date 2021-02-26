import time

from pyenergenie import energenie

from . socket import SocketDevice, SocketGroupDevice


energenie.init()


class SocketDeviceImpl(SocketDevice, energenie.Devices.ENER002):

    def __init__(self, name, home_id, device_id=0, retries=4, delay=0.5):
        SocketDevice.__init__(self, name, home_id, device_id, retries, delay)
        energenie.Devices.ENER002.__init__(self, (int(home_id), int(device_id)))

    def turn_on(self):
        SocketDevice.turn_on(self)
        self._run(energenie.Devices.ENER002.turn_on, self)

    def turn_off(self):
        SocketDevice.turn_off(self)
        self._run(energenie.Devices.ENER002.turn_off, self)


class SocketGroupDeviceImpl(SocketGroupDevice, energenie.Devices.ENER002):

    def __init__(self, name, home_id, devices, retries=4, delay=0.5):
        SocketGroupDevice.__init__(self, name, devices, home_id, retries, delay)
        energenie.Devices.ENER002.__init__(self, (int(home_id), 0))

    def turn_on(self):
        SocketGroupDevice.turn_on(self)
        self.__run(energenie.Devices.ENER002.turn_on, 'on', self)

    def turn_off(self):
        SocketGroupDevice.turn_off(self)
        self.__run(energenie.Devices.ENER002.turn_off, 'off', self)

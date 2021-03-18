import atexit

from pyenergenie import energenie

from .energenie import EnergenieInterface


energenie.init()
atexit.register(energenie.finished)


class EnergenieInterfaceImpl(EnergenieInterface, energenie.Devices.ENER002):

    def __init__(self):
        energenie.Devices.ENER002.__init__(self, (0, 0))

    @EnergenieInterface.home_id.setter
    def home_id(self, new_home_id):
        self.device_id[0] = new_home_id

    @EnergenieInterface.device_id.setter
    def device_id(self, new_device_id):
        self.device_id[1] = new_device_id

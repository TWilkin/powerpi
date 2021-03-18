import atexit

from pyenergenie import energenie

from .energenie import EnergenieInterface


energenie.init()
atexit.register(energenie.finished)


class EnergenieInterfaceImpl(energenie.Devices.ENER002, EnergenieInterface):
    def __init__(self):
        energenie.Devices.ENER002.__init__(self, (0, 0))

    def set_ids(self, home_id: int, device_id: int):
        EnergenieInterface.set_ids(self, home_id, device_id)
        self.device_id = [home_id, device_id]

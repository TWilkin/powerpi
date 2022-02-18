import atexit

from pyenergenie.energenie import init, finished
from pyenergenie.energenie.Devices import ENER002

from .energenie import EnergenieInterface


init()
atexit.register(finished)


class EnergenieInterfaceImpl(EnergenieInterface):
    def __init__(self):
        EnergenieInterface.__init__(self)

        self.__device = ENER002((0, 0))

    def set_ids(self, home_id: int, device_id: int):
        EnergenieInterface.set_ids(self, home_id, device_id)
        self.__device.device_id = [home_id, device_id]
    
    def _turn_on(self):
        self.__device.turn_on(self)
    
    def _turn_off(self):
        self.__device.turn_off(self)

from gpiozero import Energenie

from .energenie import EnergenieInterface


class EnergenieInterfaceImpl(EnergenieInterface):
    def __init__(self):
        EnergenieInterface.__init__(self)

        self.__device = Energenie(self._device_id, initial_value=None)

    def _turn_on(self):
        self.__device.on()

    def _turn_off(self):
        self.__device.off()

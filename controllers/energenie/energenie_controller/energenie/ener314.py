from typing import Optional

from gpiozero import Energenie

from .energenie import EnergenieInterface


class EnergenieInterfaceImpl(EnergenieInterface):
    def __init__(self):
        EnergenieInterface.__init__(self)

        self.__device: Optional[Energenie] = None

    @property
    def _device(self):
        if self.__device is None:
            self.__device = Energenie(self._device_id, initial_value=None)

        return self.__device

    def _turn_on(self):
        self._device.on()

    def _turn_off(self):
        self._device.off()

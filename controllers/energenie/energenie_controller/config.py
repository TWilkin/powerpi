import os

from powerpi_common.config import ControllerConfig


class EnergenieConfig(ControllerConfig):

    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False

    @property
    def energenie_device(self):
        value = os.getenv('ENERGENIE_DEVICE')

        if value is not None:
            value = value.upper()

        return value if value is not None and value == 'ENER314' else 'ENER314-RT'

    @property
    def is_ener314_rt(self):
        return self.energenie_device == 'ENER314-RT'

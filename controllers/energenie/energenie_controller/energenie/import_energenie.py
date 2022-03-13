from powerpi_common.logger import Logger
from energenie_controller.config import EnergenieConfig


def import_energenie(config: EnergenieConfig, logger: Logger):
    # import the appropriate implementation of EnergenieInterface
    # pylint: disable=broad-except,import-outside-toplevel
    try:
        if config.is_ener314_rt:
            from .ener314rt import EnergenieInterfaceImpl as EnergenieInterface
        else:
            from .ener314 import EnergenieInterfaceImpl as EnergenieInterface
    except Exception as ex:
        if config.device_fatal:
            logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
            raise ex

        # for testing off a Pi
        logger.warn(
            'DEVICE_FATAL=false, using dummy device, no sockets will turn on/off'
        )
        from .dummy import DummyEnergenieInterface as EnergenieInterface

    return EnergenieInterface

from powerpi_common.logger import Logger
from energenie_controller.config import EnergenieConfig


def import_energenie(config: EnergenieConfig, logger: Logger):
    # import the appropriate implementation of SocketDevice
    try:
        if config.is_ener314_rt:
            from .ener314rt import EnergenieInterfaceImpl as EnergenieInterface
        else:
            from .ener314 import EnergenieInterfaceImpl as EnergenieInterface
    except Exception as e:
        if config.device_fatal:
            logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
            raise e

        # for testing off a Pi
        logger.warn(
            'DEVICE_FATAL=false, using dummy device, no sockets will turn on/off'
        )
        from .energenie import EnergenieInterface

    return EnergenieInterface

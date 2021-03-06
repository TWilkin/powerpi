from dependency_injector.wiring import inject, Provide

from powerpi_common.config import Config
from powerpi_common.container import Container
from powerpi_common.logger import Logger


@inject
def import_energenie(
    config: Config = Provide[Container.config],
    logger: Logger = Provide[Container.logger]
):
    # import the appropriate implementation of SocketDevice
    try:
        if config.is_ener314_rt:
            from . ener314rt import SocketDeviceImpl as SocketDevice, SocketGroupDeviceImpl as SocketGroupDevice
        else:
            from . ener314 import SocketDeviceImpl as SocketDevice, SocketGroupDeviceImpl as SocketGroupDevice
    except:
        if config.device_fatal:
            logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
            raise

        # for testing off a Pi
        logger.warn('DEVICE_FATAL=false, no sockets will turn on/off')
        from . socket import SocketDevice, SocketGroupDevice

    return SocketDevice, SocketGroupDevice

from node_controller.config import NodeConfig
from powerpi_common.logger import Logger


def import_pijuice(config: NodeConfig, logger: Logger):
    if config.pijuice:
        try:
            from .pijuice import PiJuiceImpl
            return PiJuiceImpl
        except Exception as ex:
            if config.device_fatal:
                logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
                raise ex

            # for testing off a Pi
            logger.warn(
                'DEVICE_FATAL=false, using dummy device, no connection will be made'
            )

    from .dummy import DummyPiJuiceInterface
    return DummyPiJuiceInterface

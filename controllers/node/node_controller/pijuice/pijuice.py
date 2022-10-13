from node_controller.config import NodeConfig
from powerpi_common.logger import Logger

from pijuice import PiJuice

from .dummy import DummyPiJuiceInterface
from .interface import PiJuiceInterface


class PiJuiceImpl(PiJuiceInterface):
    def __new__(
        cls,
        config: NodeConfig,
        logger: Logger
    ):
        try:
            instance = super().__new__(cls)
            instance.__connect()
            return instance
        except Exception as ex:
            logger.error(ex)
            if config.device_fatal:
                logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
                raise ex

            # for testing off a Pi
            logger.warn(
                'DEVICE_FATAL=false, using dummy device, no connection will be made'
            )

            return DummyPiJuiceInterface()

    def __init__(
        self,
        config: NodeConfig,
        logger: Logger
    ):
        self.__logger = logger

    @property
    def battery_level(self) -> int:
        result = self.__pijuice.status.GetChargeLevel()
        return result['data']

    @property
    def battery_charging(self) -> bool:
        result = self.__pijuice.status.GetStatus()
        return result['data']['battery'] in ('CHARGING_FROM_IN', 'CHARGING_FROM_5V_IO')

    def __connect(self):
        self.__pijuice = PiJuice()

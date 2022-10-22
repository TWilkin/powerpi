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
        # pylint: disable=broad-except
        try:
            instance = super().__new__(cls)
            instance.__connect(config)
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
        # pylint: disable=unused-argument
        pass

    @property
    def battery_level(self) -> int:
        result = self.__pijuice.status.GetChargeLevel()
        return result['data']

    @property
    def battery_charging(self) -> bool:
        result = self.__pijuice.status.GetStatus()
        return result['data']['battery'] in ('CHARGING_FROM_IN', 'CHARGING_FROM_5V_IO')

    @property
    def wake_up_on_charge(self) -> int:
        result = self.__pijuice.power.GetWakeUpOnCharge()
        return result['data']

    @wake_up_on_charge.setter
    def wake_up_on_charge(self, new_value: int):
        self.__pijuice.power.SetWakeUpOnCharge(new_value)

    @property
    def charge_battery(self) -> bool:
        result = self.__pijuice.config.GetChargingConfig()
        return result['data']['charging_enabled']

    @charge_battery.setter
    def charge_battery(self, new_value: bool):
        self.__pijuice.config.SetChargingConfig(new_value)

    def shutdown(self, delay: int):
        self.__pijuice.power.SetPowerOff(delay)

    def __connect(self, config: NodeConfig):
        # pylint: disable=unused-private-member
        i2c_bus_id = int(config.i2c_device[-1])
        i2c_address = config.i2c_address

        self.__pijuice = PiJuice(i2c_bus_id, i2c_address)

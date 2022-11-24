from typing import Union

from powerpi_common.condition import (ConditionParser, Expression,
                                      ParseException)
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager


#pylint: disable=too-many-ancestors
class ConditionDevice(Device, DeviceOrchestratorMixin, PollableMixin):
    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        variable_manager: VariableManager,
        device: str,
        on_condition: Union[Expression, None] = None,
        off_condition: Union[Expression, None] = None,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, [device]
        )
        PollableMixin.__init__(self, config, **kwargs)

        self.__variable_manager = variable_manager

        self.__on_condition = on_condition
        self.__off_condition = off_condition

    @property
    def device(self):
        return self.devices[0]

    async def initialise(self):
        await DeviceOrchestratorMixin.initialise(self)

        self.__validate()

    async def on_referenced_device_status(self, _: str, __: DeviceStatus):
        await self.poll()

    async def poll(self):
        pass

    async def _turn_on(self):
        if not self.__on_condition or await self.__check_condition(DeviceStatus.ON):
            self.device.turn_on()

    async def _turn_off(self):
        if not self.__off_condition or await self.__check_condition(DeviceStatus.OFF):
            self.device.turn_off()

    async def __check_condition(self, status: DeviceStatus):
        try:
            return self.__execute_parser(status)
        except ParseException as ex:
            self.__logger.exception(ex)

        return False

    def __execute_parser(self, status: DeviceStatus):
        condition = self.__on_condition if status == DeviceStatus.ON else self.__off_condition

        parser = ConditionParser(self.__variable_manager, {})
        return parser.conditional_expression(condition)

    def __validate(self):
        '''
        Try and run the conditions to verify they're valid
        '''
        try:
            if self.__on_condition is not None:
                self.__execute_parser(DeviceStatus.ON)

            if self.__off_condition is not None:
                self.__execute_parser(DeviceStatus.OFF)
        except ParseException as ex:
            self.log_exception(ex)

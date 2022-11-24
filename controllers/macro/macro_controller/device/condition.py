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

    async def initialise(self):
        await DeviceOrchestratorMixin.initialise(self)

        self.__validate()

    async def on_referenced_device_status(self, _: str, __: DeviceStatus):
        await self.poll()

    async def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    def __validate(self):
        '''
        Try and run the conditions to verify they're valid
        '''
        parser = ConditionParser(self.__variable_manager, {})

        success = True
        try:
            if self.__on_condition is not None:
                success &= parser.conditional_expression(self.__on_condition)

            if self.__off_condition is not None:
                success &= parser.conditional_expression(self.__off_condition)
        except ParseException as ex:
            self.log_exception(ex)
            raise ex

        if not success:
            raise ParseException('Could not validate condition')

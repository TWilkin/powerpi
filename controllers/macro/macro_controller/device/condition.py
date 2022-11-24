from asyncio import get_event_loop, sleep, wait_for
from asyncio.exceptions import CancelledError as AsyncCancelledError
from asyncio.exceptions import TimeoutError as AsyncTimeoutError
from contextlib import suppress
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
        timeout=30,
        interval=1,
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

        self.__timeout = timeout
        self.__interval = interval

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
        condition = self.__on_condition if status == DeviceStatus.ON else self.__off_condition
        parser = ConditionParser(self.__variable_manager, {})

        # this will be set to True if the condition evaluates to true before the timeout
        success = False

        # use the condition to decide when to perform the action (if at all)
        def attempt():
            try:
                return parser.conditional_expression(condition)
            except ParseException as ex:
                self.__logger.exception(ex)

            return False

        # repeat the condition check every interval seconds until the timeout seconds
        # with early termination if the condition evaluates to true
        async def repeat_condition_check():
            nonlocal success

            while True:
                if attempt():
                    success = True
                    break

                await sleep(self.__interval)

        # schedule the condition check in a task and wait for it to pass or timeout
        with suppress(AsyncCancelledError) and suppress(AsyncTimeoutError):
            task = get_event_loop().create_task(repeat_condition_check)
            await wait_for(task, self.__timeout)

        return success

    def __validate(self):
        '''
        Try and run the conditions to verify they're valid
        '''
        parser = ConditionParser(self.__variable_manager, {})

        try:
            if self.__on_condition is not None:
                parser.conditional_expression(self.__on_condition)

            if self.__off_condition is not None:
                parser.conditional_expression(self.__off_condition)
        except ParseException as ex:
            self.log_exception(ex)

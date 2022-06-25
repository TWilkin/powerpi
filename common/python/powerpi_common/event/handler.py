from typing import Awaitable, Callable

from powerpi_common.condition import ConditionParser, Expression, ParseException
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.variable import VariableManager


class EventHandler:
    def __init__(
        self,
        logger: Logger,
        variable_manager: VariableManager,
        device: Device,
        condition: Expression,
        action: Callable[[Device], Awaitable[None]]
    ):
        self.__logger = logger
        self.__variable_manager = variable_manager
        self.__device = device
        self.__condition = condition
        self.__action = action

    async def execute(self, message: dict):
        # execute the action if the condition is met
        if self.check_condition(message):
            await self.__action(self.__device)
            return True

        return False

    def check_condition(self, message: MQTTMessage):
        parser = ConditionParser(self.__variable_manager, message)

        try:
            return parser.conditional_expression(self.__condition)
        except ParseException as ex:
            self.__logger.exception('Could not evaluate condition', ex)

        return False

    def __str__(self):
        return f'{self.__device}:{self.__action}'

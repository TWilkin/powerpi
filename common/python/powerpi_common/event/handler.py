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
        #pylint: disable=too-many-arguments
        self.__logger = logger
        self.__variable_manager = variable_manager
        self.__device = device
        self.__condition = condition
        self.__action = action

    def validate(self):
        # run the condition to see if it's valid and initialise any variables
        try:
            self.__execute_parser({})
            return True
        except ParseException as ex:
            self.__logger.exception(ex)

        return False

    async def execute(self, message: dict):
        # execute the action if the condition is met
        if self.check_condition(message):
            await self.__action(self.__device)
            return True

        return False

    def check_condition(self, message: MQTTMessage):
        try:
            return self.__execute_parser(message)
        except ParseException as ex:
            self.__logger.exception(ex)

        return False

    def __execute_parser(self, message: MQTTMessage):
        parser = ConditionParser(self.__variable_manager, message)
        return parser.conditional_expression(self.__condition)

    def __str__(self):
        return f'{self.__device}:{self.__action}'

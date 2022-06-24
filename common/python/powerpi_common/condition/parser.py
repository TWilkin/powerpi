import re
from functools import reduce
from typing import Dict, List, Union

from powerpi_common.condition.errors import InvalidArgumentException, InvalidIdentifierException
from powerpi_common.condition.lexeme import Lexeme
from powerpi_common.variable import VariableManager, VariableType


Expression = Union[Dict, List, str, float, bool]


class ConditionParser:
    __IDENTIFIER_REGEX = r'^(device|sensor)(\.[A-Za-z][A-Za-z0-9_]*){2,3}$'

    def __init__(
        self,
        variable_manager: VariableManager
    ):
        self.__variable_manager = variable_manager

    def constant(self, constant: str):
        try:
            return float(constant)
        except ValueError:
            pass

        lower = constant.lower()
        if lower == 'true':
            return True
        if lower == 'false':
            return False

        return constant

    def identifier(self, identifier: str):
        split = identifier.split('.')

        if len(split) >= 3:
            identifier_type = split[0]

            if identifier_type == VariableType.DEVICE:
                if len(split) == 3:
                    name, prop = split[1:]
                    return self.device_identifier(identifier, name, prop)

            if identifier_type == VariableType.SENSOR:
                if len(split) == 4:
                    name, action, prop = split[1:]
                    return self.sensor_identifier(identifier, name, action, prop)

        raise InvalidIdentifierException(identifier)

    def device_identifier(self, identifier: str, name: str, prop: str):
        variable = self.__variable_manager.get_device(name)

        if prop == 'state':
            return variable.state

        try:
            return variable.additional_state[prop]
        except KeyError as ex:
            raise InvalidIdentifierException(identifier) from ex

    def sensor_identifier(self, identifier: str, name: str, action: str, prop: str):
        variable = self.__variable_manager.get_sensor(name, action)

        if prop == 'value':
            return variable.value
        if prop == 'unit':
            return variable.unit

        raise InvalidIdentifierException(identifier)

    def primary_expression(self, value: str):
        if isinstance(value, str) and re.match(self.__IDENTIFIER_REGEX, value):
            return self.identifier(value)

        return self.constant(value)

    def equality_expression(self, expression: Expression):
        def equals(expressions: List[Expression]):
            comparisons = []

            for value in expressions:
                comparisons.append(self.equality_expression(value))

            return reduce(
                lambda a, b: a == b,
                comparisons,
            )

        return self.__expression(Lexeme.EQUALS, expression, equals, self.primary_expression)

    @classmethod
    def __expression(cls, operator: str, expression: Expression, func, chain):
        if isinstance(expression, dict) and operator in expression:
            expressions = expression[operator]

            if isinstance(expressions, list):
                return func(expressions)

            raise InvalidArgumentException(operator, expressions)

        return chain(expression)

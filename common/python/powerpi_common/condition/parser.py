import re
from typing import Callable, Dict, List, Union

from powerpi_common.condition.errors import InvalidArgumentException, InvalidIdentifierException
from powerpi_common.condition.lexeme import Lexeme
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.variable import VariableManager, VariableType


Expression = Union[Dict, List, str, float, bool]


class ConditionParser:
    __IDENTIFIER_REGEX = r'^(device|sensor|message)(\.[A-Za-z][A-Za-z0-9_]*){1,3}$'

    def __init__(
        self,
        variable_manager: VariableManager,
        message: MQTTMessage
    ):
        self.__variable_manager = variable_manager
        self.__message = message

    def constant(self, constant: str):
        if isinstance(constant, (bool, float)):
            return constant

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

        if len(split) >= 2:
            identifier_type = split[0]

            if identifier_type == VariableType.DEVICE:
                if len(split) == 3:
                    name, prop = split[1:]
                    return self.device_identifier(identifier, name, prop)

            if identifier_type == VariableType.SENSOR:
                if len(split) == 4:
                    name, action, prop = split[1:]
                    return self.sensor_identifier(identifier, name, action, prop)

            if identifier_type == 'message':
                if len(split) == 2:
                    prop = split[1]
                    return self.message_identifier(identifier, prop)

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

    def message_identifier(self, identifier: str, prop: str):
        try:
            return self.__message[prop]
        except KeyError as ex:
            raise InvalidIdentifierException(identifier) from ex

    def primary_expression(self, value: str):
        if isinstance(value, str) and re.match(self.__IDENTIFIER_REGEX, value):
            return self.identifier(value)

        return self.constant(value)

    def unary_expression(self, expression: Expression):
        def invert(_, values: List[bool]):
            if len(values) != 1:
                raise InvalidArgumentException(Lexeme.NOT, values)
            value = values[0]
            return not value

        return self.__expression(
            expression, invert, self.primary_expression, False,
            Lexeme.NOT, Lexeme.S_NOT
        )

    def relational_expression(self, expression: Expression):
        def relation(operator: Lexeme, values: List[bool]):
            if len(values) != 2:
                raise InvalidArgumentException(operator, values)

            (value1, value2) = values

            switch = {
                Lexeme.GREATER_THAN: value1 > value2,
                Lexeme.S_GREATER_THAN: value1 > value2,
                Lexeme.GREATER_THAN_EQUAL: value1 >= value2,
                Lexeme.S_GREATER_THAN_EQUAL: value1 >= value2,
                Lexeme.LESS_THAN: value1 < value2,
                Lexeme.S_LESS_THAN: value1 < value2,
                Lexeme.LESS_THAN_EQUAL: value1 <= value2,
                Lexeme.S_LESS_THAN_EQUAL: value1 <= value2,
            }

            return switch[operator]

        return self.__expression(
            expression, relation, self.unary_expression, True,
            Lexeme.GREATER_THAN, Lexeme.S_GREATER_THAN,
            Lexeme.GREATER_THAN_EQUAL, Lexeme.S_GREATER_THAN_EQUAL,
            Lexeme.LESS_THAN, Lexeme.S_LESS_THAN,
            Lexeme.LESS_THAN_EQUAL, Lexeme.S_LESS_THAN_EQUAL
        )

    def equality_expression(self, expression: Expression):
        def equals(_, values: List[bool]):
            # if the set only has one value, they're all equal
            return len(set(values)) == 1

        return self.__expression(
            expression, equals, self.relational_expression, True,
            Lexeme.EQUALS, Lexeme.S_EQUAL
        )

    def logical_and_expression(self, expression: Expression):
        def logical_and(_, values: List[bool]):
            return all(values)

        return self.__expression(
            expression, logical_and, self.equality_expression, True,
            Lexeme.WHEN, Lexeme.AND, Lexeme.S_AND
        )

    def logical_or_expression(self, expression: Expression):
        def logical_or(_, values: List[bool]):
            return any(values)

        return self.__expression(
            expression, logical_or, self.logical_and_expression, True,
            Lexeme.EITHER, Lexeme.OR, Lexeme.S_OR
        )

    def conditional_expression(self, expression: Expression):
        return self.logical_or_expression(expression)

    def __expression(
        self,
        expression: Expression,
        func: Callable[[Lexeme, List[bool]], bool],
        chain: Callable[[Expression], bool],
        expects_list: bool,
        *operators: List[Lexeme]
    ):
        if isinstance(expression, Dict):
            # is one of the operators in the expression
            operator = next(
                (operator for operator in operators if operator in expression),
                None
            )

            if operator is not None:
                expressions = expression[operator]

                if expects_list:
                    if not isinstance(expressions, list):
                        raise InvalidArgumentException(operator, expression)
                else:
                    if isinstance(expressions, list):
                        raise InvalidArgumentException(operator, expression)

                    expressions = [expressions]

                values = [
                    self.conditional_expression(expression)
                    for expression in expressions
                ]

                return func(operator, values)

        return chain(expression)

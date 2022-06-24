import re
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

    def unary_expression(self, expression: Expression):
        def invert(_, expression: Expression):
            value = self.unary_expression(expression)
            return not value

        return self.__expression(
            expression, invert, self.primary_expression,
            Lexeme.NOT, Lexeme.S_NOT
        )

    def relational_expression(self, expression: Expression):
        def relation(operator: Lexeme, expressions: List[Expression]):
            if not isinstance(expressions, list) or len(expressions) != 2:
                raise InvalidArgumentException(operator, expressions)

            (value1, value2) = [self.relational_expression(value)
                                for value in expressions]

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
            expression, relation, self.unary_expression,
            Lexeme.GREATER_THAN, Lexeme.S_GREATER_THAN,
            Lexeme.GREATER_THAN_EQUAL, Lexeme.S_GREATER_THAN_EQUAL,
            Lexeme.LESS_THAN, Lexeme.S_LESS_THAN,
            Lexeme.LESS_THAN_EQUAL, Lexeme.S_LESS_THAN_EQUAL
        )

    def equality_expression(self, expression: Expression):
        def equals(_, expressions: List[Expression]):
            if not isinstance(expressions, list):
                raise InvalidArgumentException(Lexeme.EQUALS, expressions)

            # get all the values
            values = [self.equality_expression(value) for value in expressions]

            # if the set only has one value, they're all equal
            return len(set(values)) == 1

        return self.__expression(
            expression, equals, self.relational_expression,
            Lexeme.EQUALS, Lexeme.S_EQUAL
        )

    def logical_and_expression(self, expression: Expression):
        def logical_and(_, expressions: List[Expression]):
            if not isinstance(expressions, list):
                raise InvalidArgumentException(Lexeme.AND, expressions)

            values = [
                self.logical_and_expression(value)
                for value in expressions
            ]

            return all(values)

        return self.__expression(
            expression, logical_and, self.equality_expression,
            Lexeme.AND, Lexeme.S_AND
        )

    def logical_or_expression(self, expression: Expression):
        def logical_or(_, expressions: List[Expression]):
            if not isinstance(expressions, list):
                raise InvalidArgumentException(Lexeme.OR, expressions)

            values = [
                self.logical_or_expression(value)
                for value in expressions
            ]

            return any(values)

        return self.__expression(
            expression, logical_or, self.logical_and_expression,
            Lexeme.OR, Lexeme.S_OR
        )

    @classmethod
    def __expression(cls, expression: Expression, func, chain, *operators: List[Lexeme]):
        if isinstance(expression, Dict):
            # is one of the operators in the expression
            operator = next(
                (operator for operator in operators if operator in expression),
                None
            )

            if operator is not None:
                argument = expression[operator]

                return func(operator, argument)

        return chain(expression)

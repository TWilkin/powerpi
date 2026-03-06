import operator as operators
from functools import reduce
from typing import Callable, Dict, List

from powerpi_common.condition.errors import (InvalidArgumentException,
                                             InvalidIdentifierException,
                                             UnexpectedTokenException)
from powerpi_common.condition.lexeme import Lexeme
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.variable import VariableManager, VariableType

Expression = dict | list | str | float | bool


class ConditionParser:
    '''
    Class to interpret a complex conditional expression, evaluate that expression and return
    true or false based on that evaluation. Supports boolean and/or, boolean inversion,
    equality check, relational check and retrieving values from any type of variable
    (device, sensor or the message that triggered the condition)

    e.g.
    parser = ConditionParser(
        variable_manager,
        {'button': 'middle', 'type': 'single', 'timestamp': 12345}
    )

    parser.conditional_expression(
        {
            'when': [
              { 'equals': ['var.message.button', 'middle'] },
              { 'equals': ['var.message.type', 'single'] },
              {
                'either': [
                  { 'equals': ['var.device.Light.state', 'off'] },
                  { 'equals': ['var.device.Light.state', 'unknown'] }
                ]
              }
        }
    )

    Which will evaluate to true, if the message is for a single middle button press,
    and the light is currently off, or that state of the light is unknown.
    '''

    def __init__(
        self,
        variable_manager: VariableManager,
        message: MQTTMessage | None = None
    ):
        self.__variable_manager = variable_manager
        self.__message = message

    @classmethod
    def constant(cls, constant: str):
        '''
        Evaluate and return the constant in the parameter.
        '''
        if constant is None:
            return None

        if isinstance(constant, (bool, float, int, str)):
            return constant

        raise UnexpectedTokenException(constant)

    def identifier(self, expression: Expression):
        '''
        Evaluate and return the value of the identifier in the parameter,
        either a device, sensor or message.
        '''
        def variable(_, values: List[str]):
            if len(values) != 1:
                raise InvalidArgumentException(Lexeme.VAR, values)

            identifier = values[0]
            split = identifier.split('.')

            if len(split) >= 2:
                identifier_type = split[0]

                if identifier_type == VariableType.DEVICE and len(split) == 3:
                    name, prop = split[1:]
                    return self.device_identifier(identifier, name, prop)

                if identifier_type == VariableType.SENSOR and len(split) == 4:
                    name, action, prop = split[1:]
                    return self.sensor_identifier(identifier, name, action, prop)

                if identifier_type == 'message' and len(split) == 2:
                    prop = split[1]
                    return self.message_identifier(identifier, prop)

            raise InvalidIdentifierException(identifier)

        return self.__expression(
            expression, variable, self.constant, False,
            Lexeme.VAR
        )

    def device_identifier(self, identifier: str, name: str, prop: str):
        '''
        Return the value of the device identifier.
        e.g. {'var': 'device.Light.state'}
        '''
        variable = self.__variable_manager.get_device(name)

        if prop == 'state':
            return variable.state
        if prop == 'scene':
            return variable.scene

        try:
            return variable.additional_state[prop]
        except KeyError as ex:
            raise InvalidIdentifierException(identifier) from ex

    def sensor_identifier(self, identifier: str, name: str, action: str, prop: str):
        '''
        Return the value of the sensor identifier.
        e.g. {'var': 'sensor.Hallway.motion.state'}
        '''
        variable = self.__variable_manager.get_sensor(name, action)

        try:
            if prop == 'value':
                return variable.value.value
            if prop == 'unit':
                return variable.value.unit
            if prop == 'state':
                return variable.state
        except AttributeError:
            pass

        raise InvalidIdentifierException(identifier)

    def message_identifier(self, identifier: str, prop: str):
        '''
        Return the value of the message identifier.
        e.g. {'var': 'message.state'}
        '''
        if self.__message is None:
            raise InvalidIdentifierException(identifier)

        try:
            return self.__message[prop]
        except KeyError:
            return None

    def primary_expression(self, value: str):
        '''
        Evaluate and return the primary expression in the parameter,
        either an identifier or a constant.
        e.g.
            {'var': 'device.Light.state'}
            'a string'
            12.34
            true
        '''
        return self.identifier(value)

    def unary_expression(self, expression: Expression):
        '''
        Evaluate and return the unary expression in the parameter.
        e.g. {'not': true}
        '''
        def invert(_, values: List[bool]):
            if len(values) != 1:
                raise InvalidArgumentException(Lexeme.NOT, values)
            value = values[0]
            return not value

        return self.__expression(
            expression, invert, self.primary_expression, False,
            Lexeme.NOT, Lexeme.S_NOT
        )

    def multiplicative_expression(self, expression: Expression):
        '''
        Evaluate and return the multiplicative expression in the parameter
        e.g. {'*': [1, 2]}
        '''
        def multiplicative(operator: Lexeme, values: list[int | float]):
            reduce_operators = {
                Lexeme.MULTIPLY: operators.mul,
                Lexeme.S_MULTIPLY: operators.mul,
                Lexeme.DIVIDE: operators.truediv,
                Lexeme.S_DIVIDE: operators.truediv
            }

            return reduce(reduce_operators[operator], values)

        return self.__expression(
            expression, multiplicative, self.unary_expression, True,
            Lexeme.MULTIPLY, Lexeme.S_MULTIPLY,
            Lexeme.DIVIDE, Lexeme.S_DIVIDE
        )

    def additive_expression(self, expression: Expression):
        '''
        Evaluate and return the additive expression in the parameter
        e.g. {'+': [1, 2]}
        '''
        def additive(operator: Lexeme, values: list[int | float]):
            reduce_operators = {
                Lexeme.ADD: operators.add,
                Lexeme.S_ADD: operators.add,
                Lexeme.SUBTRACT: operators.sub,
                Lexeme.S_SUBTRACT: operators.sub
            }

            return reduce(reduce_operators[operator], values)

        return self.__expression(
            expression, additive, self.multiplicative_expression, True,
            Lexeme.ADD, Lexeme.S_ADD,
            Lexeme.SUBTRACT, Lexeme.S_SUBTRACT
        )

    def relational_expression(self, expression: Expression):
        '''
        Evaluate and return the relational expression in the parameter.
        e.g. {'>=': [1, 2]}
        '''
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
            expression, relation, self.additive_expression, True,
            Lexeme.GREATER_THAN, Lexeme.S_GREATER_THAN,
            Lexeme.GREATER_THAN_EQUAL, Lexeme.S_GREATER_THAN_EQUAL,
            Lexeme.LESS_THAN, Lexeme.S_LESS_THAN,
            Lexeme.LESS_THAN_EQUAL, Lexeme.S_LESS_THAN_EQUAL
        )

    def equality_expression(self, expression: Expression):
        '''
        Evaluate and return the equality expression in the parameter.
        e.g. {'equals': [1, 1.0]}
        '''
        def equals(_, values: List[bool]):
            # if the set only has one value, they're all equal
            return len(set(values)) == 1

        return self.__expression(
            expression, equals, self.relational_expression, True,
            Lexeme.EQUALS, Lexeme.S_EQUAL
        )

    def logical_and_expression(self, expression: Expression):
        '''
        Evaluate and return the logical and expression in the parameter.
        e.g. {'when': [True, True]}
        '''
        def logical_and(_, values: List[bool]):
            return all(values)

        return self.__expression(
            expression, logical_and, self.equality_expression, True,
            Lexeme.WHEN, Lexeme.AND, Lexeme.S_AND
        )

    def logical_or_expression(self, expression: Expression):
        '''
        Evaluate and return the logical or expression in the parameter.
        e.g. {'either': [True, False]}
        '''
        def logical_or(_, values: List[bool]):
            return any(values)

        return self.__expression(
            expression, logical_or, self.logical_and_expression, True,
            Lexeme.EITHER, Lexeme.OR, Lexeme.S_OR
        )

    def conditional_expression(self, expression: Expression):
        '''
        Evaluate and return the conditional expression in the parameter.
        e.g. {'when': [True, True]}
        '''
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

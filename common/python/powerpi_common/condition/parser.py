from powerpi_common.variable import VariableManager, VariableType


class ConditionParser:
    def __init__(
        self,
        variable_manager: VariableManager
    ):
        self.__variable_manager = variable_manager

    def identifier(self, identifier: str):
        split = identifier.split('.')

        if len(split) >= 2:
            identifier_type = split[0]

            if identifier_type == VariableType.DEVICE:
                if len(split) == 2:
                    return self.__variable_manager.get_device(split[1])

            if identifier_type == VariableType.SENSOR:
                if len(split) == 3:
                    return self.__variable_manager.get_sensor(split[1], split[2])

        raise InvalidIdentifierException(identifier)


class ParseException(Exception):
    pass


class InvalidIdentifierException(ParseException):
    def __init__(self, identifier: str):
        ParseException.__init__(self, f'Invalid identifier "{identifier}"')

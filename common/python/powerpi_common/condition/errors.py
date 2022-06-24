class ParseException(Exception):
    pass


class InvalidIdentifierException(ParseException):
    def __init__(self, identifier: str):
        ParseException.__init__(self, f'Invalid identifier "{identifier}"')


class InvalidArgumentException(ParseException):
    def __init__(self, operator: str, operand: dict):
        ParseException.__init__(
            self, f'Invalid argument for operator "{operator}: {operand}'
        )

from powerpi_common.condition.lexeme import Lexeme


class ParseException(Exception):
    pass


class InvalidIdentifierException(ParseException):
    def __init__(self, identifier: str):
        ParseException.__init__(self, f'Invalid identifier "{identifier}"')


class InvalidArgumentException(ParseException):
    def __init__(self, operator: Lexeme, operand: dict):
        ParseException.__init__(
            self, f'Invalid argument for operator "{operator}: {operand}'
        )


class UnexpectedTokenException(ParseException):
    def __init__(self, token: str):
        ParseException.__init__(
            self, f'Unexpected token "{token}"'
        )

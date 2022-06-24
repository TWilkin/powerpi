class ParseException(Exception):
    pass


class InvalidIdentifierException(ParseException):
    def __init__(self, identifier: str):
        ParseException.__init__(self, f'Invalid identifier "{identifier}"')

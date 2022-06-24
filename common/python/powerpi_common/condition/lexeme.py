from enum import Enum


class Lexeme(str, Enum):
    AND = 'and'
    EQUALS = 'equals'
    NOT = 'not'
    OR = 'or'

    # symbol aliases
    S_AND = '&'
    S_EQUAL = '='
    S_NOT = '!'
    S_OR = '|'

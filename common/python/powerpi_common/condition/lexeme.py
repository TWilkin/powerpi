from enum import Enum


class Lexeme(str, Enum):
    AND = 'and',
    EQUALS = 'equals'
    NOT = 'not'
    OR = 'or'

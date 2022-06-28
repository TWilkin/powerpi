from enum import Enum


class Lexeme(str, Enum):
    AND = 'and'
    EITHER = 'either'
    EQUALS = 'equals'
    GREATER_THAN = 'greater than'
    GREATER_THAN_EQUAL = 'greater than equal'
    LESS_THAN = 'less than'
    LESS_THAN_EQUAL = 'less than equal'
    NOT = 'not'
    OR = 'or'
    VAR = 'var'
    WHEN = 'when'

    # symbol aliases
    S_AND = '&'
    S_EQUAL = '='
    S_GREATER_THAN = '>'
    S_GREATER_THAN_EQUAL = '>='
    S_LESS_THAN = '<'
    S_LESS_THAN_EQUAL = '<='
    S_NOT = '!'
    S_OR = '|'

from enum import Enum


class Lexeme(str, Enum):
    AND = 'and'
    EITHER = 'either'
    EQUALS = 'equals'
    GREATER_THAN = 'greater_than'
    GREATER_THAN_EQUAL = 'greater_than_equal'
    LESS_THAN = 'less_than'
    LESS_THAN_EQUAL = 'less_than_equal'
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

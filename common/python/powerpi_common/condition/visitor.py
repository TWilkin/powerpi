from abc import ABC

from powerpi_common.condition.parser import Constant, Expression, Lexeme
from powerpi_common.condition.errors import ParseException


class ConditionVisitor(ABC):
    '''
    A ConditionVisitor which can be extended to parse a condition expression to find
    specific nodes in the condition.
    '''

    __lexeme_mapping = {
        Lexeme.WHEN: Lexeme.AND,
        Lexeme.S_AND: Lexeme.AND,
        Lexeme.EITHER: Lexeme.OR,
        Lexeme.S_OR: Lexeme.OR,
        Lexeme.S_NOT: Lexeme.NOT,
        Lexeme.S_EQUAL: Lexeme.EQUALS,
        Lexeme.S_GREATER_THAN: Lexeme.GREATER_THAN,
        Lexeme.S_GREATER_THAN_EQUAL: Lexeme.GREATER_THAN_EQUAL,
        Lexeme.S_LESS_THAN: Lexeme.LESS_THAN,
        Lexeme.S_LESS_THAN_EQUAL: Lexeme.LESS_THAN_EQUAL,
        Lexeme.S_ADD: Lexeme.ADD,
        Lexeme.S_SUBTRACT: Lexeme.SUBTRACT,
        Lexeme.S_MULTIPLY: Lexeme.MULTIPLY,
        Lexeme.S_DIVIDE: Lexeme.DIVIDE
    }

    def visit(self, node: Expression):
        if isinstance(node, dict):
            for key, value in node.items():
                # convert to the lexeme alias, if there is one
                lexeme = self.__lexeme_mapping.get(key, key)

                # call the visitor for this key
                method = getattr(
                    self, f'visit_{lexeme}', self.generic_visit
                )
                method(value)
        elif isinstance(node, list):
            # call the visitor for each item in the list
            for item in node:
                self.visit(item)
        elif isinstance(node, Constant):
            self.visit_constant(node)
        else:
            self.generic_visit(node)

    def visit_and(self, expression: Expression):
        '''
        Override to consume an and/when expression.
        '''

    def visit_or(self, expression: Expression):
        '''
        Override to consume an or/either expression.
        '''

    def visit_not(self, expression: Expression):
        '''
        Override to consume a not expression.
        '''

    def visit_equals(self, expression: Expression):
        '''
        Override to consume an equals expression.
        '''

    def visit_greater_than(self, expression: Expression):
        '''
        Override to consume a greater_than expression.
        '''

    def visit_greater_than_equal(self, expression: Expression):
        '''
        Override to consume a greater_than_equal expression.
        '''

    def visit_less_than(self, expression: Expression):
        '''
        Override to consume a less_than expression.
        '''

    def visit_less_than_equal(self, expression: Expression):
        '''
        Override to consume a less_than_equal expression.
        '''

    def visit_add(self, expression: Expression):
        '''
        Override to consume an add expression.
        '''

    def visit_subtract(self, expression: Expression):
        '''
        Override to consume a subtract expression.
        '''

    def visit_multiply(self, expression: Expression):
        '''
        Override to consume a multiply expression.
        '''

    def visit_divide(self, expression: Expression):
        '''
        Override to consume a divide expression.
        '''

    def visit_var(self, expression: Expression):
        '''
        Override to consume a var expression.
        '''

    def visit_constant(self, value: Constant):
        '''
        Override to consume a constant.
        '''

    def generic_visit(self, expression: Expression):
        raise ParseException()

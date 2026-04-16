from inspect import currentframe

import pytest

from powerpi_common.condition import ConditionVisitor, ParseException
from powerpi_common.condition.lexeme import Lexeme


class RecordingVisitor(ConditionVisitor):
    def __init__(self):
        self.calls: list[tuple[str, object]] = []

    def _record(self, expression):
        name = currentframe().f_back.f_code.co_name.removeprefix('visit_')
        self.calls.append((name, expression))

    def visit_and(self, expression):
        self._record(expression)

    def visit_or(self, expression):
        self._record(expression)

    def visit_not(self, expression):
        self._record(expression)

    def visit_equals(self, expression):
        self._record(expression)

    def visit_greater_than(self, expression):
        self._record(expression)

    def visit_greater_than_equal(self, expression):
        self._record(expression)

    def visit_less_than(self, expression):
        self._record(expression)

    def visit_less_than_equal(self, expression):
        self._record(expression)

    def visit_add(self, expression):
        self._record(expression)

    def visit_subtract(self, expression):
        self._record(expression)

    def visit_multiply(self, expression):
        self._record(expression)

    def visit_divide(self, expression):
        self._record(expression)

    def visit_var(self, identifier):
        self._record(identifier)

    def visit_constant(self, value):
        self._record(value)


_ALIASES = {
    Lexeme.WHEN: 'and',
    Lexeme.S_AND: 'and',
    Lexeme.EITHER: 'or',
    Lexeme.S_OR: 'or',
    Lexeme.S_NOT: 'not',
    Lexeme.S_EQUAL: 'equals',
    Lexeme.S_GREATER_THAN: 'greater_than',
    Lexeme.S_GREATER_THAN_EQUAL: 'greater_than_equal',
    Lexeme.S_LESS_THAN: 'less_than',
    Lexeme.S_LESS_THAN_EQUAL: 'less_than_equal',
    Lexeme.S_ADD: 'add',
    Lexeme.S_SUBTRACT: 'subtract',
    Lexeme.S_MULTIPLY: 'multiply',
    Lexeme.S_DIVIDE: 'divide',
}


class TestConditionVisitor:

    @pytest.mark.parametrize('key', list(Lexeme))
    def test_lexeme_dispatches_to_canonical_visit(self, key: Lexeme):
        visitor = RecordingVisitor()
        expected = _ALIASES.get(key, key.value)

        visitor.visit({key: 'payload'})

        assert (expected, 'payload') in visitor.calls

    def test_list_visits_each_item(self):
        visitor = RecordingVisitor()

        visitor.visit([1, 'two', True])

        assert visitor.calls == [
            ('constant', 1),
            ('constant', 'two'),
            ('constant', True),
        ]

    @pytest.mark.parametrize('value', ['text', 12, 3.14, False])
    def test_constant_routes_to_visit_constant(self, value):
        visitor = RecordingVisitor()

        visitor.visit(value)

        assert visitor.calls == [('constant', value)]

    def test_nested_dict_recurses(self):
        visitor = RecordingVisitor()

        visitor.visit({
            Lexeme.WHEN: [
                {Lexeme.EQUALS: [{Lexeme.VAR: 'device.Light.state'}, 'on']}
            ]
        })

        assert ('equals', [
            {Lexeme.VAR: 'device.Light.state'}, 'on'
        ]) in visitor.calls
        assert ('var', 'device.Light.state') in visitor.calls
        assert ('constant', 'on') in visitor.calls

    def test_unknown_key_raises(self):
        visitor = RecordingVisitor()

        with pytest.raises(ParseException):
            visitor.visit({'bogus': 'payload'})

    def test_unknown_type_raises(self):
        visitor = RecordingVisitor()

        with pytest.raises(ParseException):
            visitor.visit(object())

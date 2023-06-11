import re


class VariableTestBase:
    def test_name(self, subject):
        assert subject.name is not None

    def test_variable_type(self, subject):
        assert subject.variable_type is not None

    def test_json(self, subject):
        assert subject.json is not None
        assert isinstance(subject.json, dict)

    def test_str(self, subject):
        assert bool(re.match(
            r'^var\.(device|sensor)\..*=\{.*\}$',
            str(subject)
        )) is True

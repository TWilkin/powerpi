from abc import ABC, abstractmethod

from pytest_mock import MockerFixture


class VariableTestBase(ABC):
    @abstractmethod
    def create_subject(self, _: MockerFixture):
        raise NotImplementedError

    def test_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.name is not None

    def test_variable_type(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.variable_type is not None

    def test_json(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.json is not None
        assert isinstance(subject.json, dict)

from abc import ABC
from pytest_mock import MockerFixture


class InitialisableMixinTestBase(ABC):
    def test_initialise_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        subject.initialise()

from abc import ABC

from pytest_mock import MockerFixture


class BaseDeviceTestBase(ABC):
    def test_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.name is not None

    def test_display_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.display_name is not None

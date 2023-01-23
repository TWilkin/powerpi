from abc import ABC

from powerpi_common.device.base import BaseDevice
from pytest_mock import MockerFixture


class BaseDeviceTestBase(ABC):
    def test_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.name is not None

    def test_display_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.display_name is not None


class BaseDeviceTestBaseNew(ABC):
    def test_name(self, subject: BaseDevice):
        assert subject.name is not None

    def test_display_name(self, subject: BaseDevice):
        assert subject.display_name is not None

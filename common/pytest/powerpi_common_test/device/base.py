from abc import ABC

from powerpi_common.device.base import BaseDevice


class BaseDeviceTestBase(ABC):
    def test_name(self, subject: BaseDevice):
        assert subject.name is not None

    def test_display_name(self, subject: BaseDevice):
        assert subject.display_name is not None

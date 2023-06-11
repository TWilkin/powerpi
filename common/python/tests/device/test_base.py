from typing import Callable, Union

import pytest
from powerpi_common_test.device.base import BaseDeviceTestBase

from powerpi_common.device.base import BaseDevice


class DeviceImpl(BaseDevice):
    pass


SubjectBuilder = Callable[[Union[str, None]], BaseDevice]


class TestBaseDevice(BaseDeviceTestBase):

    def test_name(self, subject: BaseDevice):
        assert subject.name == 'TestDevice'

    def test_display_name(self, subject_builder: SubjectBuilder):
        # pylint: disable=arguments-renamed

        display_name = 'Test Device'
        subject = subject_builder(display_name)

        assert subject.display_name == display_name

    def test_no_display_name(self, subject: SubjectBuilder):
        assert subject.display_name == 'TestDevice'

    @pytest.fixture
    def subject_builder(self):
        def build(display_name: Union[str, None] = None):
            return DeviceImpl('TestDevice', display_name)

        return build

    @pytest.fixture
    def subject(self, subject_builder):
        return subject_builder()

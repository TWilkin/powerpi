from abc import abstractmethod
from typing import Callable

import pytest

from pytest_mock import MockerFixture

from powerpi_common_test.device.base import BaseDeviceTestBase


class SensorTestBase(BaseDeviceTestBase):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture, func: Callable[[], None] = None):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        # allow us to do extra mocking before setting up the subject
        if func is not None:
            func()

        return self.get_subject(mocker)

    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

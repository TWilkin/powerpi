from abc import ABC
from unittest.mock import PropertyMock

import pytest
from powerpi_common.config import Config
from powerpi_common.device.mixin import PollableMixin
from pytest_mock import MockerFixture


class PollableMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    async def test_poll_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.poll()

    def test_polling_enabled(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.polling_enabled is True

    def test_poll_frequency(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.poll_frequency >= 10


class PollableMixingTestBaseNew(ABC):
    @pytest.mark.asyncio
    async def test_poll_implemented(self, subject: PollableMixin):
        await subject.poll()

    def test_polling_enabled(self, subject: PollableMixin):
        assert subject.polling_enabled is True

    def test_poll_frequency(self, subject: PollableMixin):
        assert subject.poll_frequency >= 10

    @pytest.fixture(autouse=True)
    def poll_frequency(self, powerpi_config: Config):
        type(powerpi_config).poll_frequency = PropertyMock(return_value=120)

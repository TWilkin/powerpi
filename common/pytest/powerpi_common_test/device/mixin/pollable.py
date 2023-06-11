from abc import ABC
from unittest.mock import PropertyMock

from powerpi_common.config import Config
from powerpi_common.device.mixin import PollableMixin

import pytest


class PollableMixinTestBase(ABC):
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

from abc import ABC

import pytest

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

from abc import ABC

import pytest

from pytest_mock import MockerFixture


class PollableMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    async def test_poll_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.poll()

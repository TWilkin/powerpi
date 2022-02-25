import pytest

from abc import ABC, abstractmethod
from pytest_mock import MockerFixture


class PollableMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

    async def test_poll_implemented(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        await subject.poll()

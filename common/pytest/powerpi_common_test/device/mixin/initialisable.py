import pytest

from abc import ABC
from pytest_mock import MockerFixture


class InitialisableMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio
    
    async def test_initialise_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.initialise()

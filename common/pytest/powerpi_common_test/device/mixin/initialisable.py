from abc import ABC

import pytest
from powerpi_common.device.mixin import InitialisableMixin
from pytest_mock import MockerFixture


class InitialisableMixinTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    async def test_initialise_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.initialise()

    async def test_deinitialise_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.deinitialise()


class InitialisableMixinTestBaseNew(ABC):
    @pytest.mark.asyncio
    async def test_initialise_implemented(self, subject: InitialisableMixin):
        await subject.initialise()

    @pytest.mark.asyncio
    async def test_deinitialise_implemented(self, subject: InitialisableMixin):
        await subject.deinitialise()

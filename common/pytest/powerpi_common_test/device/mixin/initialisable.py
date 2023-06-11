from abc import ABC

from powerpi_common.device.mixin import InitialisableMixin

import pytest


class InitialisableMixinTestBase(ABC):
    @pytest.mark.asyncio
    async def test_initialise_implemented(self, subject: InitialisableMixin):
        await subject.initialise()

    @pytest.mark.asyncio
    async def test_deinitialise_implemented(self, subject: InitialisableMixin):
        await subject.deinitialise()

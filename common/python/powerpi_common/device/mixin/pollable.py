from abc import ABC, abstractmethod

from powerpi_common.util import await_or_sync


class PollableMixin(ABC):
    async def poll(self):
        await await_or_sync(self._poll)
    
    @abstractmethod
    def _poll(self):
        raise NotImplementedError

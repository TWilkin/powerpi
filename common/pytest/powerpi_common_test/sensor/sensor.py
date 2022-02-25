import pytest

from abc import ABC, abstractmethod
from pytest_mock import MockerFixture


class SensorTestBase(ABC):
    pytestmark = pytest.mark.asyncio
    
    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

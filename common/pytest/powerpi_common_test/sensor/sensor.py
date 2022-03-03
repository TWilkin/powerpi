from typing import Callable
import pytest

from abc import ABC, abstractmethod
from pytest_mock import MockerFixture


class SensorTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture, func: Callable[[], None]=None):
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        # allow us to do extra mocking before setting up the subject
        if func is not None:
            func()
        
        return self.get_subject(mocker)
    
    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

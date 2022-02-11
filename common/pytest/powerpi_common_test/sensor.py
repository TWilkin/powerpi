from abc import ABC, abstractmethod

from pytest_mock import MockerFixture


class SensorTestBase(ABC):
    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

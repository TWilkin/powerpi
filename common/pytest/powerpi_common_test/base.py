from abc import ABC, abstractmethod

from pytest_mock import MockerFixture


class BaseTest(ABC):
    @abstractmethod
    def create_subject(self, _: MockerFixture) -> object:
        raise NotImplementedError

from abc import ABC


class InitialisableMixin(ABC):
    def initialise(self):
        raise NotImplementedError

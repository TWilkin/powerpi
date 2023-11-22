from typing import List

from powerpi_common.device.mixin import CapabilityMixin


class StreamCapabilityMixin(CapabilityMixin):
    '''
    Mixin to add stream capability by broadcasting list of available streams.
    '''

    def __init__(self):
        self.__streams: List[str] = []

    @property
    def streams(self):
        return self.__streams

    @streams.setter
    def streams(self, new_streams: List[str]):
        self.__streams = new_streams

        self.on_capability_change()

    @CapabilityMixin.supports_other_capabilities.getter
    def supports_other_capabilities(self):
        # pylint: disable=invalid-overridden-method
        return {'streams': self.__streams}

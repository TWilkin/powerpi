from powerpi_common.device.base import BaseDevice


class Sensor(BaseDevice):
    def __init__(
        self, 
        name: str, 
        location: str,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False
    ):
        BaseDevice.__init__(self, name, display_name, visible)

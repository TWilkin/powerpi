class Sensor(object):
    def __init__(
        self, 
        name: str, 
        location: str,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False
    ):
        self._name = name
        self._display_name = display_name if display_name is not None else name

    @property
    def name(self):
        return self._name
    
    def __str__(self):
        return f'{type(self).__name__}({self._display_name})'

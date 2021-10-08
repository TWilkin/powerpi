from typing import List

class LIFXColour(object):
    def __init__(self, colour: List[int]):
        self.__colour = colour
    
    @property
    def hue(self):
        return self.__colour[0] if self.__colour is not None else 0
    
    @property
    def saturation(self):
        return self.__colour[1] if self.__colour is not None else 0
    
    @property
    def brightness(self):
        return self.__colour[2] if self.__colour is not None else 0
    
    @property
    def temperature(self):
        return self.__colour[3] if self.__colour is not None else 0

    @property
    def list(self):
        return self.__colour if self.__colour is not None else [0, 0, 0, 0]
    
    def to_json(self):
        return {
            'hue': self.hue,
            'saturation': self.saturation,
            'brightness': self.brightness,
            'temperature': self.temperature
        }
    
    def __str__(self):
        return 'HSBK({}, {}, {}, {})'.format(self.hue, self.saturation, self.brightness, self.temperature)
    
    def __eq__(self, other):
        if isinstance(other, LIFXColour):
            return self.list == other.list
        
        return False

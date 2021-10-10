from typing import Tuple

class LIFXColour(object):
    def __init__(self, colour: Tuple[int] or dict):
        if isinstance(colour, dict):
            self.__colour = (colour.get('hue', 0), colour.get('saturation', 0), colour.get('brightness', 0), colour.get('temperature', 0))
        else:
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
        return self.__colour if self.__colour is not None else (0, 0, 0, 0)
    
    def to_json(self):
        return {
            'hue': self.hue,
            'saturation': self.saturation,
            'brightness': self.brightness,
            'temperature': self.temperature
        }
    
    def __str__(self):
        return f'HSBK({self.hue}, {self.saturation}, {self.brightness}, {self.temperature})'
    
    def __eq__(self, other):
        if isinstance(other, LIFXColour):
            return self.list == other.list
        
        return False

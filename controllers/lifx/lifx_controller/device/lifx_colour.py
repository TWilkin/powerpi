from typing import Dict, Tuple

class LIFXColour(object):
    def __init__(self, colour: Tuple[int] or Dict[str, int]):
        if colour is None:
            self.hue = 0
            self.saturation = 0
            self.brightness = 0
            self.temperature = 0
        elif isinstance(colour, dict):
            self.hue = colour['hue'] if 'hue' in colour else 0
            self.saturation = colour['saturation'] if 'saturation' in colour else 0
            self.brightness = colour['brightness'] if 'brightness' in colour else 0
            self.temperature = colour['temperature'] if 'temperature' in colour else 0
        else:
            self.hue = colour[0]
            self.saturation = colour[1]
            self.brightness = colour[2]
            self.temperature = colour[3]

    @property
    def list(self):
        return (self.hue, self.saturation, self.brightness, self.temperature)
    
    def patch(self, colour: Dict[str, int or str]):
        if colour is not None:
            for key, value in colour.items():
                new_value = value

                if isinstance(value, str):
                    # handle an increment/decrement
                    if value.startswith('+'):
                        new_value = self[key] + int(value[1:])
                    elif value.startswith('-'):
                        new_value = self[key] - int(value[1:])
                    else:
                        new_value = int(value)

                self[key] = new_value          
    
    def to_json(self):
        return {
            'hue': self.hue,
            'saturation': self.saturation,
            'brightness': self.brightness,
            'temperature': self.temperature
        }
    
    def __getitem__(self, key: str) -> int:
        if key == 'hue':
            return self.hue
        if key == 'saturation':
            return self.saturation
        if key == 'brightness':
            return self.brightness
        if key == 'temperature':
            return self.temperature

        raise KeyError(key)
    
    def __setitem__(self, key: str, value: int or str):
        if key == 'hue':
            self.hue = value
        elif key == 'saturation':
            self.saturation = value
        elif key == 'brightness':
            self.brightness = value
        elif key == 'temperature':
            self.temperature = value
        else:
            raise KeyError(key)
    
    def __str__(self):
        return f'HSBK({self.hue}, {self.saturation}, {self.brightness}, {self.temperature})'
    
    def __eq__(self, other):
        if isinstance(other, LIFXColour):
            return self.list == other.list
        
        return False
